'use strict'
const {app, dialog} = require('electron')
const version = app.getVersion()
const versionCheck = require('github-version-checker')

function checkUpdates () {
  // version check options
  const options = {
    repo: 'atom/atom',
    currentVersion: version
  }

  versionCheck(options, function (update) { // callback function
    if (update) { // print some update info if an update is available
      // console.log('An update is available!')
      // console.log('New version: ' + update.tag_name)
      // console.log('Details here: ' + update.html_url)

      let message = 'Check it. ' + app.getName() + ' ' + update.tag_name + ' is hot off the press. You got it and this greatness will be awoken next time you open this app. You\'re welcome.'
      if (update.body) {
        const splitNotes = update.body.split(/[^\r]\n/)
        message += '\n\nWhat\'s new:\n'
        splitNotes.forEach(notes => {
          message += notes + '\n\n'
        })
      }
      // Ask user to update the app
      dialog.showMessageBox({
        type: 'question',
        buttons: [
          'Let\'s do this now.', 'Ehh I\'m fine for now. Later.'
        ],
        defaultId: 0,
        message: 'Huzzah! El nuevo ' + app.getName() + ' has been d-loaded :D',
        detail: message
      }, response => {
        if (response === 0) {
          console.log('go to github release')
        }
      })
    }

    // start your app
    console.log('Starting app...')
    // ...
  })
}

module.exports = checkUpdates
