# skillshare-downloader
Node.JS app to download content off of Skillshare.com for offline use.

#### Do not use this for piracy, support the course creators!

## Usage

#### Installation and setting up
1. Go to the project directory and run `npm i` to install all the dependencies
2. Log in to skillshare.com and grab your cookie by opening the developer console (in Chrome F12) and typing in `document.cookie`
3. Open the `config.json` and paste the cookie in the sessionCookie key
4. `downloadDir` can be left as is, the app will create a new folder named after the course you are downloading
5. Choose a course to download and copy paste the link into `courseUrl`, for example:
https://www.skillshare.com/classes/The-Ultimate-Guide-to-Text-Animators-in-After-Effects/1141129555
6. Start the app by running `node app`

#### Concurrent downloads will be added later on, the setting currently does nothing in the config
