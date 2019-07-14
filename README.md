# CommonChromeExtensions

Utility functions for chrome extensions.


## How to use

The files in this project are meant to be symlinked.  To use a file, do the following:

1.  Navigate to the location you want to symlink to
2.  Create a symlink to one of the files in this project (eg. `ln -s ../../_CommonChromeExtensions/utils.js .`)
    1.  Remember to symlink the associated test file as well (ie. for `utils.ts`, also symlink `utils.test.ts`)
3.  Make sure your build process handles symlinks appropriately
    1.  In webpack, this means setting `resolve.symlinks: false` in your webpack config
4.  When your project is ready to publish, replace the symlinked file with a copy of the real one (so that all code is fully contained in your repo)

NOTE: symlinked files are ignore in chrome extensions, so only symlink files to projects that have a build step (that removes the symlink in the final output).
