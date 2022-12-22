import './FilmRating.css'

const FilmRating = ({voteAverage, sx}) =>{

  const ratingToColorConverter = (value) =>{
    switch(true){
    case value >= 0 && value <= 3: return '#E90000'
    case value > 3 && value <= 5: return '#E97E00'
    case value > 5 && value <= 7: return '#E9D100'
    case value > 7: return '#66E900'
    default: return 'black'
    }
  }

  const color = ratingToColorConverter(voteAverage)
  return(
    <div className='film-rating' style={{borderColor: color, ...sx}}>{voteAverage}</div>
  )

}
export default FilmRating