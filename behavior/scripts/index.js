'use strict'

const getCurrentWeather = require('./lib/getCurrentWeather')

const firstOfEntityRole = function(message, entity, role) {
  role = role || 'generic';

  const slots = message.slots
  const entityValues = message.slots[entity]
  const valsForRole = entityValues ? entityValues.values_by_role[role] : null

  return valsForRole ? valsForRole[0] : null
}

exports.handle = function handle(client) {
  const collectCity = client.createStep({
    satisfied() {
      console.log('checking satisfied condition for collectCity');
      return Boolean(client.getConversationState().weatherCity)
    },

    extractInfo() {
     console.log('>>>extracting info for city...');
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

  const provideWeather = client.createStep({
    satisfied() {
      return false
    },

    prompt(callback) {
      let weatherData = {
        temperature: 60,
        condition: 'sunny',
        city: client.getConversationState().weatherCity.value,
      }

      client.addResponse('app:response:name:provide_weather/current', weatherData)
      client.done()
      // getCurrentWeather(client.getConversationState().weatherCity.value, resultBody => {
      //   if (!resultBody || resultBody.cod !== 200) {
      //     console.log('Error getting weather.')
      //     callback()
      //     return
      //   }

      //   const weatherDescription = (
      //     resultBody.weather.length > 0 ?
      //     resultBody.weather[0].description :
      //     null
      //   )

      //   const weatherData = {
      //     temperature: Math.round(resultBody.main.temp),
      //     condition: weatherDescription,
      //     city: resultBody.name,
      //   }

      //   console.log('sending real weather:', weatherData)
      //   client.addResponse('app:response:name:provide_weather/current', weatherData)
      //   client.done()

      //   callback()
      // })
    },
  })

  client.runFlow({
    classifications: {},
    streams: {
      main: 'getWeather',
      getWeather: [collectCity, provideWeather],
    }
  })
}
