'use strict'

const firstOfEntityRole = function(message, entity, role) {
  role = role || 'generic';

  const slots = message.slots
  const entityValues = message.slots[entity]
  const valsForRole = entityValues ? entityValues.values_by_role[role] : null

  return valsForRole ? valsForRole[0] : null
}

exports.handle = function handle(client) {

  const sayHello = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().helloSent)
    },

    prompt() {
      client.addResponse('app:response:name:welcome')
      client.addResponse('app:response:name:provide/documentation', {
        documentation_link: 'http://docs.init.ai',
      })
      client.addResponse('app:response:name:provide/instructions')
      client.updateConversationState({
        helloSent: true
      })
      client.done()
    }
  })

  const collectCity = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().weatherCity)
    },

    extractInfo() {
      const city = firstOfEntityRole(client.getMessagePart(), 'city')

      if (city) {
        client.updateConversationState({
          weatherCity: city,
        })

        console.log('User wants the weather in:', city.value)
      }
    },

    prompt() {
      client.addResponse('app:response:name:prompt/weather_city')
      client.done()
    },
  })

  const untrained = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('app:response:name:apology/untrained')
      client.done()
    }
  })

  const collectCity = client.createStep({
    satisfied() {
      console.log('is collectCity satisfied?');
      return Boolean(client.getConversationState().weatherCity)
    },

    prompt() {
      // Need to prompt user for city    
      console.log('Need to ask user for city')
      client.done()
    },
  })

  const provideWeather = client.createStep({
    satisfied() {
      console.log('is provideWeather satisfied?');
      return false
    },

    prompt() {
      // Need to provide weather
      client.done()
    },
  })

  client.runFlow({
    classifications: {
			// map inbound message classifications to names of streams
    },
    streams: {
      main: 'getWeather',
      hi: [sayHello],
      getWeather: [collectCity, provideWeather],
    }
  })
}
