import React,{Component} from 'react'
import {Link} from 'react-router-dom'
import Transaction from './Transaction.js'
import {Button} from 'react-bootstrap'



const POLL_INERVAL_MS = 10000;

class TransactionPool extends Component{
    state={transactionPoolMap:{}}

    fetchTransactionPoolMap=()=>{
        fetch(`${document.location.origin}/api/transaction-pool-map`    )
        .then(response=>response.json())
        .then(json=>this.setState({transactionPoolMap:json}))
    }
    mineTransactions=()=>{
        fetch(`${document.location.origin}/api/mine-transactions`).then(response=>response.json()).then(json=>alert("mining successfull"))
    }
    componentDidMount(){
        this.fetchTransactionPoolMap()
        this.fetchPoolMapInterval=setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INERVAL_MS
          );
    }
    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval);
      }
    render(){
        return(
            <div className="TransactionPool">
            <div><Link to="/">Home</Link></div>
            <h3>Transaction Pool Map</h3>
            {
          Object.values(this.state.transactionPoolMap).map(transaction => {
            return (
              <div key={transaction.id}>
                <hr />
                <Transaction    transaction={transaction} />
              </div>
            )
          })
        }
          <hr />
          <Button
            bsstyle="danger"
            bss ize="small"
            onClick={this.mineTransactions}
            >
            MineTransactions
            </Button>  
            </div>
        )
    }

}

export default TransactionPool