# www.qur2.eu

The [qur2.eu](http://qur2.eu/) website.

## Usage

#### Fetch contents

Before building the site, the data need to be pulled from various APIs.
A small utility is provided for this:

    $ npm install
    $ node serve.js pump

It will enable you to create some json file that will be used as content for the site generation.

#### Build

This is a static website generated using [Kerouac](https://github.com/jaredhanson/kerouac):

    $ make css
    $ make site

#### Preview

Once generated, the site can be previewed locally by running the server:

    $ node serve.js site

and navigating to: [http://127.0.0.1:3000/](http://127.0.0.1:3000/)

#### Publish

    $ make publish

## License

[Creative Commons Attribution-ShareAlike 3.0](http://creativecommons.org/licenses/by-sa/3.0/)

Copyright (c) 2012-2013 Aurélien Scoubeau <[http://aurelienscoubeau.eu/](http://aurelienscoubeau.eu/)>
