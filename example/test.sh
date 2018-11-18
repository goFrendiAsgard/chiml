DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
tsc --build ${DIR}/tsconfig.json
node ${DIR}/../dist/chie.js ${DIR}/animal-calendar.yml 2018
node ${DIR}/../dist/chie.js ${DIR}/dist/dogInjection.js ${DIR}/animal-calendar.yml 2018
