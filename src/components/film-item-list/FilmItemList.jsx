import React from 'react'
import PropTypes from 'prop-types'

import FilmItem from '../film-item/FilmItem.jsx'
import './FilmItemList.css'

const FilmItemList = ({ films, rateMovie }) => {

  FilmItemList.defaultProps = {
    films: [],
    genres: []
  }

  FilmItemList.propTypes = {
    films: PropTypes.arrayOf(PropTypes.object),
    genres: PropTypes.arrayOf(PropTypes.object)
  }

  return (
    <ul className="film-list">
      {films.map((item) => {
        const { id, ...itemProps } = item

        return <FilmItem 
          key={id} 
          filmId={id}
          posterPath={itemProps.poster_path}
          releaseDate={itemProps.release_date}
          title={itemProps.title}
          voteAverage={itemProps.vote_average}
          overview={itemProps.overview}
          rating={itemProps.rating}
          rateMovie={rateMovie}
          genreIds={itemProps.genre_ids}/>
      })}
    </ul>
  )
}

export default FilmItemList