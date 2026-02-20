# 배포 가이드

> housing-project AWS Lightsail + Docker Compose 배포 절차

## 사전 조건

- AWS CLI 설정 완료
- Terraform >= 1.5 설치
- Route 53 호스팅 존 보유
- Lightsail SSH 키 페어 생성

## 1. Terraform 부트스트랩 (S3 Backend)

```bash
cd infra/bootstrap
terraform init
terraform apply

# 출력값을 backend.hcl로 저장
terraform output -json | jq -r '
  "bucket         = \"\(.bucket.value)\"",
  "dynamodb_table = \"\(.dynamodb_table.value)\"",
  "region         = \"\(.region.value)\"",
  "key            = \"prod/terraform.tfstate\"",
  "encrypt        = true"
' > ../backend.hcl
```

## 2. 인프라 배포 (Lightsail + CloudFront + ACM + Route53)

```bash
cd infra/
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars 편집 (도메인, zone ID, SSH key, CF secret)

terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```

## 3. 서버 초기 배포

```bash
# Lightsail SSH 접속
ssh ubuntu@<lightsail-ip>

git clone <repo> ~/housing-project
cd ~/housing-project
cp .env.production.example .env.production
# .env.production 편집 (API 키, DB 비밀번호, CF_SECRET_TOKEN)

docker compose -f compose.prod.yml up -d --build
```

## 4. DB 마이그레이션

```bash
docker compose -f compose.prod.yml exec app \
  node -e "const{execSync}=require('child_process');execSync('npx drizzle-kit migrate',{stdio:'inherit'})"
```

## 5. 데이터 이관 (로컬 → Lightsail)

```bash
# 로컬: 이관 전 기준선 기록
export COMPOSE_PROJECT_NAME=housing
LOCAL_PG=$(docker compose ps -q postgres)
docker exec $LOCAL_PG psql -U housing -d housing -c \
  "SELECT tablename, n_live_tup FROM pg_stat_user_tables ORDER BY tablename;" > pre_dump_counts.txt

# 로컬: pg_dump
docker exec $LOCAL_PG pg_dump -U housing -Fc --no-owner --no-privileges housing > housing.dump

# SCP 전송
scp housing.dump pre_dump_counts.txt ubuntu@<lightsail-ip>:~/

# Lightsail에서:
REMOTE_PG=$(docker compose -f compose.prod.yml ps -q postgres)
docker exec $REMOTE_PG psql -U housing -d housing -c "CREATE EXTENSION IF NOT EXISTS postgis;"
docker cp ~/housing.dump $REMOTE_PG:/tmp/
docker exec $REMOTE_PG pg_restore -U housing -d housing \
  --no-owner --no-privileges --clean --if-exists /tmp/housing.dump

# 검증: 레코드 수 대조
docker exec $REMOTE_PG psql -U housing -d housing -c \
  "SELECT tablename, n_live_tup FROM pg_stat_user_tables ORDER BY tablename;"
```

## 6. 이후 업데이트 (다운타임 최소화)

```bash
# 서버에서 앱만 재빌드 (DB/Redis 유지)
git pull
docker compose -f compose.prod.yml build app
docker compose -f compose.prod.yml up -d --no-deps app
```

> `docker compose up --build` (전체)는 DB 재시작 위험. **반드시 `--no-deps app` 사용.**

## 7. SSH 터널 (Bastion DB 접근)

```bash
ssh -N -L 5432:localhost:5432 -L 6379:localhost:6379 ubuntu@<lightsail-ip>
# 별도 터미널: psql -h localhost -p 5432 -U housing -d housing
```

## 8. 배포 후 점검

```bash
# 메모리 실측
docker stats --no-stream

# X-CF-Secret 검증
curl -I http://<lightsail-ip>/                  # → 403
curl -I http://<lightsail-ip>/api/health        # → 403
curl -I http://<lightsail-ip>/_next/static/x    # → 404 (면제)
curl -I -H "X-CF-Secret: <token>" http://<lightsail-ip>/          # → 200
curl -I -H "X-CF-Secret: <token>" http://<lightsail-ip>/api/health  # → 200
```

## 9. Smoke Test (7개 시나리오)

1. `https://도메인/` → 랜딩 페이지
2. `https://도메인/search` → 입력 폼
3. 최소 입력 → `/results` → 분석 결과
4. `/complex/[id]` → 상세 페이지 + 점수 분해
5. `/privacy`, `/terms` → 법률 페이지
6. 모바일 접속 → 반응형
7. `/api/health` → 200 OK

## 월간 운영 비용

| 항목 | 비용 |
|------|------|
| Lightsail 2GB/2vCPU | $10/월 |
| Route 53 | $0.50/월 |
| CloudFront (포트폴리오) | ~$0 |
| **합계** | **~$10.50/월** |
