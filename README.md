# gch

Simple web server for pushing GitLab CI build notifications to HipChat

## Install

```bash
$ npm install -g gch
```

## Usage
```
gch

  usage: gch [options]

  options:
    -h, --help                show help and usage
    -v, --version             show version
    -p, --port <port>         use specific port (3030)
    -u, --url <url>           GitLab CI url (required)
    -r, --roomId <roomId>     HipChat room id (required)
    -t, --token <token>       HipChat api token (required)
```

## Author

Evan Lucas

## License

MIT
