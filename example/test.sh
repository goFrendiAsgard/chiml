DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
node ${DIR}/../chie.js ${DIR}/animal-calendar.yml 2018
node ${DIR}/../chie.js ${DIR}/dogInjection.js ${DIR}/animal-calendar.yml 2018
