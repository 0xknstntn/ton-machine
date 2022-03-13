from sys import argv
trash, api = argv
print('Use API-key: ' + api)
js=open('api.js', 'w');
js.write(f'var apiFromMachine="{api}"')
js.close()