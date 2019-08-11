import glob from 'glob';

//create a separate config for each file so that rollup fully bundles each file without
//respect to the others.  In other words, if I don't make a separate config for each
//file, then rollup sees that I'm also bundling the other files and assumes I'll be
//able to "import" from those other files, so it doesn't bundle anything -- it just outputs
//the files as they are.
export default glob.sync(`src/*.js`).map((pathToFile, i) => ({
    input: pathToFile,
    output: {
        dir: './dist',
        format: 'esm',
    },
}));
