# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.1.0"></a>
# [1.1.0](https://github.com/kaltura/playkit-js-cast-receiver/compare/v1.0.1...v1.1.0) (2021-04-28)


### Bug Fixes

* **FEC-11141:** Black video with sound when casting on Google Android TV ([#41](https://github.com/kaltura/playkit-js-cast-receiver/issues/41)) ([6cac7f2](https://github.com/kaltura/playkit-js-cast-receiver/commit/6cac7f2))


### Features

* **FEC-9236:** Add support for new live Alpha in cast SDK  ([#42](https://github.com/kaltura/playkit-js-cast-receiver/issues/42)) ([b4a170f](https://github.com/kaltura/playkit-js-cast-receiver/commit/b4a170f))



## [1.0.1](https://github.com/kaltura/playkit-js-cast-receiver/compare/v1.0.0...v1.0.1) (2020-11-03)


### Build System

* remove plugins that already exist on preset-env ([#35](https://github.com/kaltura/playkit-js-cast-receiver/issues/35)) ([9169b57](https://github.com/kaltura/playkit-js-cast-receiver/commit/9169b57))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.6.1...v1.0.0) (2020-09-08)


### Features

* **FEC-10347:** expose kaltura player as a global variable instead of UMD ([#31](https://github.com/kaltura/playkit-js-cast-receiver/issues/31)) ([7a39583](https://github.com/kaltura/playkit-js-cast-receiver/commit/7a39583))


### BREAKING CHANGES

* **FEC-10347:** This package is not UMD anymore

Solves FEC-10347



## [0.6.1](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.6.0...v0.6.1) (2020-08-06)



## [0.6.0](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.4.0...v0.6.0) (2020-08-05)


### Bug Fixes

* add NPM deployment with release notes and fix flow issues ([#24](https://github.com/kaltura/playkit-js-cast-receiver/issues/24)) ([fd6ded4](https://github.com/kaltura/playkit-js-cast-receiver/commit/fd6ded4))


### Features

* **FEC-10160:** filter unsupported formats from the configured tracks passed to the receiver ([#28](https://github.com/kaltura/playkit-js-cast-receiver/issues/28)) ([132c9ec](https://github.com/kaltura/playkit-js-cast-receiver/commit/132c9ec))
* **FEC-10290:** upgrade NPM packages ([#30](https://github.com/kaltura/playkit-js-cast-receiver/issues/30)) ([a3ba719](https://github.com/kaltura/playkit-js-cast-receiver/commit/a3ba719))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.4.0...v0.5.0) (2020-07-07)


### Bug Fixes

* add NPM deployment with release notes and fix flow issues ([#24](https://github.com/kaltura/playkit-js-cast-receiver/issues/24)) ([fd6ded4](https://github.com/kaltura/playkit-js-cast-receiver/commit/fd6ded4))


### Features

* **FEC-10160:** filter unsupported formats from the configured tracks passed to the receiver ([#28](https://github.com/kaltura/playkit-js-cast-receiver/issues/28)) ([132c9ec](https://github.com/kaltura/playkit-js-cast-receiver/commit/132c9ec))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.3.0...v0.4.0) (2019-12-05)


### Features

* **FEC-9175:** cast content coming from external sources ([#17](https://github.com/kaltura/playkit-js-cast-receiver/issues/17)) ([8667bbf](https://github.com/kaltura/playkit-js-cast-receiver/commit/8667bbf))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.2.0...v0.3.0) (2019-01-20)


### Features

* **FEC-8749:** expose IMA ad data ([#15](https://github.com/kaltura/playkit-js-cast-receiver/issues/15)) ([06d5475](https://github.com/kaltura/playkit-js-cast-receiver/commit/06d5475))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.1.3...v0.2.0) (2018-11-20)


### Bug Fixes

* **FEC-8619:** default captions aren't applied after preroll ([#9](https://github.com/kaltura/playkit-js-cast-receiver/issues/9)) ([55c79fd](https://github.com/kaltura/playkit-js-cast-receiver/commit/55c79fd))
* add null protections ([#14](https://github.com/kaltura/playkit-js-cast-receiver/issues/14)) ([ae85344](https://github.com/kaltura/playkit-js-cast-receiver/commit/ae85344))


### Features

* redirect stream ([#8](https://github.com/kaltura/playkit-js-cast-receiver/issues/8)) ([ee29d81](https://github.com/kaltura/playkit-js-cast-receiver/commit/ee29d81))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.1.2...v0.1.3) (2018-10-24)


### Bug Fixes

* **FEC-8610:** set currentTime to null isn't seek the stream to the live edge ([#7](https://github.com/kaltura/playkit-js-cast-receiver/issues/7)) ([e642c46](https://github.com/kaltura/playkit-js-cast-receiver/commit/e642c46))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.1.1...v0.1.2) (2018-10-23)


### Bug Fixes

* **FEC-8552:** when seeking a video by dragging the scrubber, the scrubber jumps back before it reaches the seek point ([#6](https://github.com/kaltura/playkit-js-cast-receiver/issues/6)) ([be358b4](https://github.com/kaltura/playkit-js-cast-receiver/commit/be358b4))
* **FEC-8610:** when casting DVR it start from the beginning ([#5](https://github.com/kaltura/playkit-js-cast-receiver/issues/5)) ([e5df0cf](https://github.com/kaltura/playkit-js-cast-receiver/commit/e5df0cf))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/kaltura/playkit-js-cast-receiver/compare/v0.1.0...v0.1.1) (2018-10-15)


### Bug Fixes

* **FEC-8579:** endless seeking in live stream ([#4](https://github.com/kaltura/playkit-js-cast-receiver/issues/4)) ([2db61df](https://github.com/kaltura/playkit-js-cast-receiver/commit/2db61df))



<a name="0.1.0"></a>
# 0.1.0 (2018-10-14)


### Bug Fixes

* live edge detection and logs ([8e69ce5](https://github.com/kaltura/playkit-js-cast-receiver/commit/8e69ce5))


### Features

* add support to get vmapAdsRequest from customData ([#3](https://github.com/kaltura/playkit-js-cast-receiver/issues/3)) ([c6a618e](https://github.com/kaltura/playkit-js-cast-receiver/commit/c6a618e))
* cast receiver - 1st version ([#1](https://github.com/kaltura/playkit-js-cast-receiver/issues/1)) ([0ddd282](https://github.com/kaltura/playkit-js-cast-receiver/commit/0ddd282))
