# Stormpath Angular2 SDK - Preview Release

This is a preview release of our Angular 2 library.

## Installation

This library is not yet on NPM, you should clone this library and then prepare
it for symlinking:

```bash
git clone git@github.com:robertjd/sp-ng2.git
npm link
```

Then do this in the root of the project where you would like to use this module.

```bash
npm link ng2-stormpath
```

## SystemJS, Webpack, etc

At the moment we have an example, in the example folder, of how to configure
this library if you are using SystemJS.  We will investigate other package
loaders in the future.

## Incuding in your project

You will want to import the module like this:

```
import {
  Account,
  AuthPortComponent,
  Stormpath
} from 'ng2-stormpath/ng2-stormpath';
```

To see how these components can be used, see the example/ folder in this project.

## Development

To generate all `*.js`, `*.js.map` and `*.d.ts` files:

```bash
$ npm run tsc
```

## Help

If you have an issue while integrating this library, please make sure to look
at the open issues on this repository.  You may also contact us via email at
support@stormpath.com or visit our [support center][].

## License

Apache 2.0, see [LICENSE](LICENSE).

[support center]: https://support.stormpath.com
