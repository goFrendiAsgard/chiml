DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
node ${DIR}/../chie.js ${DIR}/components.js ${DIR}/animal-calendar.yml 2018
