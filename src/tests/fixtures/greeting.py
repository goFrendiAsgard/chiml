import sys, getopt

def greet(argv):
    try:
        opts, args = getopt.getopt(argv, 'g:n:', ('greeting=', 'name='))
    except getopt.GetOptError:
        print ('Usage')
        print ('* python3 greeting.py -g <greeting> -n <name>')
        print ('* python3 greeting.py --greeing <greeting> --name <name>')
    greeting = 'hello'
    name = 'world'
    for opt, arg in opts:
        if opt in ('-g', '--greeting'):
            greeting = arg
        if opt in ('-n', '--name'):
            name = arg
    print(' '.join((greeting, name)))

if __name__ == '__main__':
    greet(sys.argv[1:])
