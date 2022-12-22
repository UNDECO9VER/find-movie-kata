import { Spin, Alert} from 'antd'
import { Component } from 'react'


import './ComponentState.css'

class FilmTab extends Component {

  render(){
    const {componentState} = this.props
    return(
      <div>
        {componentState.loading && <Spin style={{position: 'fixed', top:'50%', left:'50%'}} size='large' tip='Loading...'/>}
        {componentState.error && <Alert message='Connection Error' description='Ooops, somthing go wrong...' type='error'/>}
        {componentState.emptySearch && <Alert message='Эх...' description='По вашему запросу ничего не найденно' type='info'/>}
        {(componentState.loading==false && componentState.error==false) && this.props.children}
      </div>
    )
  }
}

export default FilmTab