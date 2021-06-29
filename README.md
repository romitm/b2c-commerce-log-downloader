# Job Log Downloader

Salesforce B2C Commerce Cloud (Demandware) Job Log Downloader. The process also uploads to a specified SFTP folder.

## Installation

Use NPM to install and create the libraries before execution.

```bash
npm install
```

## Configuration

- Rename the config.json.sample file to config.json.
- Add the variable attributes and save the file.

## Execution

Just run the grunt command to run the default task chain.

```bash
grunt
```

## Result

- The files will be downloaded in the specified folder
- There will be a compressed (zip) version available in the same folder
- If the SFTP information is supplied, then the files will be uploaded to the SFTP

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

Unlicensed.
