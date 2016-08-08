'use strict'

const cli = require('heroku-cli-util')
const plugins = require('../plugins')
const S = require('string')

function topicCommand (cmd) {
  let idx = cmd.indexOf(':')
  if (idx === -1) return [cmd]
  return [cmd.slice(0, idx), cmd.slice(idx + 1)]
}

function all () {
  plugins.load()
  let {topics} = require('../..')
  let max = require('lodash.maxby')

  cli.log(`Usage: heroku COMMAND [--app APP] [command-specific-options]

CLI topics: (run ${cli.color.cmd('heroku help TOPIC')} for details)
`)
  topics = topics.filter(t => !t.hidden)
  let maxLength = max(topics, 'name.length').name.length
  for (let topic of topics) {
    cli.log(`  heroku ${S(topic.name).padRight(maxLength)} # ${topic.description}`)
  }
  cli.log()
}

function topic (cmd) {
  plugins.load()
  let max = require('lodash.maxby')
  let commands = require('../..').commands

  let [topic, command] = topicCommand(cmd)
  command = commands.find(c => c.topic === topic && (c.command === command || (!c.command && !command)))

  if (command) {
    let cmd = command.command ? `${command.topic}:${command.command}` : command.topic
    cli.log(`Usage: ${cli.color.cmd('heroku ' + cmd)}

  ${command.description}
`)
    if (command.flags) {
      for (let flag of command.flags) {
        cli.log(` --${flag.name} # ${flag.description}`)
      }
      cli.log()
    }
  }

  if (cmd.includes(':')) return

  cli.log(`heroku ${cmd} commands: (${cli.color.cmd('heroku help ' + cmd + ':COMMAND')} for details)
`)
  commands = commands.filter(c => c.topic === cmd && c.command)
  let maxLength = max(commands, 'command.length').command.length + cmd.length + 1
  for (let command of commands) {
    let cmd = command.command ? `${command.topic}:${command.command}` : command.topic
    cli.log(`  ${S(cmd).padRight(maxLength)} # ${command.description}`)
  }
  cli.log()
}

function run (context) {
  if (context && context.args.topic) topic(context.args.topic)
  else all()
  process.exit(0)
}

module.exports = {
  topic: 'help',
  args: [{name: 'topic', required: false}],
  run
}