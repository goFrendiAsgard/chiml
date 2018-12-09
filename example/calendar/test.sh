DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "TESTING CALENDAR"
tsc --build ${DIR}/tsconfig.json
node ${DIR}/../../dist/chie.js 2017 -c ${DIR}/animal-calendar-no-injection.yml
node ${DIR}/../../dist/chie.js -c ${DIR}/animal-calendar.yml 2018
node ${DIR}/../../dist/chie.js --injection ${DIR}/dist/dogInjection.js --container ${DIR}/animal-calendar.yml 2019
