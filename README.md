# PlayKit JS Cast Receiver

[![Build Status](https://github.com/kaltura/kaltura/playkit-js-cast-receiver/actions/workflows/run_canary_full_flow.yaml/badge.svg)](https://github.com/kaltura/kaltura/playkit-js-cast-receiver/actions/workflows/run_canary_full_flow.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

PlayKit JS Cast Receiver is a custom receiver SDK, which relies on the Google [CAF Receiver SDK] and is used to serve any of the PlayKit platform senders - [Web], [iOS] and [Android].

PlayKit JS Cast Receiver is written in [ECMAScript6], statically analyzed using [Flow], and transpiled in ECMAScript5 using [Babel].

[flow]: https://flow.org/
[ecmascript6]: https://github.com/ericdouglas/ES6-Learning#articles--tutorials
[babel]: https://babeljs.io
[caf receiver sdk]: https://developers.google.com/cast/docs/caf_receiver_overview
[android]: https://github.com/kaltura/playkit-android-googlecast
[ios]: https://github.com/kaltura/playkit-ios-googlecast
[web]: https://github.com/kaltura/playkit-js-cast-sender

## Quick Start

Go to [Create a basic receiver app](./docs/create-basic-receiver-app.md).

## Receiver Application ID

1.  Sign in to the [Google Cast SDK Developer Console](https://cast.google.com/u/0/publish/#/signup).
2.  [Register](https://developers.google.com/cast/docs/registration) your Custom Receiver URL to obtain an application ID.

## Documentation

- [Configuration & API](./docs/configuration-api.md)
- [Guides](./docs/guides.md)
