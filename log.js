const { performance, PerformanceObserver } = require('perf_hooks')

const version = require('./package.json').version
const deploymentId =
  process.env.BEFAAS_DEPLOYMENT_ID || 'unknownDeploymentId'

const uniqueFnId = require('crypto')
  .randomBytes(32)
  .toString('hex')

const fnName = process.env.BEFAAS_FN_NAME || 'unknownFn'

function log (event) {
  process.stdout.write(
    'BEFAAS' +
      JSON.stringify({
        timestamp: new Date().getTime(),
        now: performance.now(),
        version,
        deploymentId,
        fn: {
          id: uniqueFnId,
          name: fnName
        },
        event
      }) +
      '\n'
  )
}

new PerformanceObserver(list =>
  list.getEntries().forEach(perf => {
    const perfName = perf.name.split(':')
    if (perfName.shift() !== fnName) return
    log({
      contextId: perfName.shift(),
      xPair: perfName.shift(),
      perf: { mark: perfName.join(':'), name: perf.name, entryType: perf.entryType, startTime: perf.startTime, duration: perf.duration }
    })
  })
).observe({ entryTypes: ['mark', 'measure', 'function'] })

log({
  coldstart: true
})

module.exports = log
module.exports.fnName = fnName
