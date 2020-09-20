import React,{Component} from 'react';
import logo from '../images/logo.jpg'
import Blocks from '../components/Blocks.js'
import {Link} from 'react-router-dom'
import TransactionPool from '../components/TransactionPool.js'

class App extends Component {
    state={walletInfo:{
    }}

    componentDidMount(){
        fetch(`${document.location.origin}/api/wallet-info`).then(response=>response.json().then(data=>this.setState({walletInfo:data}))).catch(error=>console.log(error))
    }

    render(){
        const {address,balance}=this.state.walletInfo;
        return(
           <div className="App">
               <img className="logo" src={logo}></img>
        <div>  Welcome to blockchain...</div>
        <br />
        <div><Link to="/blocks">Blocks</Link></div>
        <div><Link to="/conductTransaction">Conduct Transaction</Link></div>
        <div><Link to="/transactionPool">Transaction Pool</Link></div>
        <div className="walletInfo">
        <div> Address:{address}</div>
        <div> Blance:{balance}</div>
        </div>   



        </div> 

        )
    }
}

export default App;
