# Vidom code repository



less is failing to download: use:
https://www.npmjs.com/package/less
npm install less


If you experience an error regarding bcrypt, follow this instruction:

In cmd window (open with administrator rights), navigate to the folder where your project is saved. Run these commands:

(This command installs node-gyp dependencies, including python:)
npm install --global --production windows-build-tools
(This command installs the node-gyp package:)
npm install --global node-gyp
(This command installs the node-gyp package. Not sure if it is needed..:)
npm install node-gyp -g 
(These commands install the bcrypt package:)
npm install bcrypt -g 
npm install bcrypt -save
