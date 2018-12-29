DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

tsc --build ${DIR}/tsconfig.json
chie ${DIR}/web.yml
chie ${DIR}/user-service.yml
chie ${DIR}/transaction-service.yml
