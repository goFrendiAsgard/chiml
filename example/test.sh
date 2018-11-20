DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
tsc --build ${DIR}/tsconfig.json
node ${DIR}/../dist/chie.js -c ${DIR}/animal-calendar.yml 2018
node ${DIR}/../dist/chie.js --injection ${DIR}/dist/dogInjection.js --container ${DIR}/animal-calendar.yml 2018
