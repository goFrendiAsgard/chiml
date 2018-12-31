DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

tsc --build ${DIR}/tsconfig.json
chie ${DIR}/service.history.yml
