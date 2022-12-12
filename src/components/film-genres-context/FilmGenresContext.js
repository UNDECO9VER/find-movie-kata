import React from 'react'
const {Provider : FilmGenresProvider,
  Consumer: FilmGenresConsumer} = React.createContext()

export {
  FilmGenresProvider , 
  FilmGenresConsumer
}