# B17 stuff

## Outguess interface device

Main API is in [pages/api/outguess.js](https://github.com/claus/b17/blob/main/pages/api/outguess.js).

- Install Node.js
- `npm i`
- `npm run dev`

## Some useful scripts

- [base64fixer.js](https://github.com/claus/b17/blob/main/scripts/base64fixer.js) - There was a cipher in B17 where Morse code translated to base64(-ish). Problem was that Morse does not have upper and lowercode characters. obviously. This script tries to figure out the character case.

- [pager-word-extract.js](https://github.com/claus/b17/blob/main/scripts/pager-word-extract.js) - This creates a word list out of the B17 #the-pager corpus. Might be useful for brute force attacks.

- [thefirst-decode.js](https://github.com/claus/b17/blob/main/scripts/thefirst-decode.js) - Pulls binary data out of `thefirst.png`, extracted from the Coastal Device. This was a bit tricky because the image is weirdly resized.

- [zinc-decode.js](https://github.com/claus/b17/blob/main/scripts/zinc-decode.js) - Pulls binary data out of `zinc.jpg`, extracted from Syphon-Signal-Registered-XIIXVIIXVIIXVVI.jpg. Standard RGB to ASCII stuff.
