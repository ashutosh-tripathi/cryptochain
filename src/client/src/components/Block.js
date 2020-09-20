import React,{Component} from 'react'
import {Button} from 'react-bootstrap'
import Transaction from './Transaction.js'


class Block extends Component{
    state={displayTransaction:false}
    toggleTransaction=()=>{
        this.setState({displayTransaction:!this.state.displayTransaction})
    }
get displayTransactions(){
    const {data}=this.props.block
    const stringifiedData=JSON.stringify(data)

const dataDisplay=stringifiedData.length>35?`${stringifiedData.substring(0,35)}...`:stringifiedData

if(this.state.displayTransaction){
return(
    <div>
      {
          data.map(transaction=>(
            <div key={transaction.id}>
              <hr />
              <Transaction transaction={transaction} />
              </div>
          ))
       
         }   <br />
        <Button
            bsstyle="danger"
            bss ize="small"
            onClick={this.toggleTransaction}
          >
            Show Less
          </Button>  
      </div>
)
}
else{
return (
            <div>
              <div>Data: {dataDisplay}</div>
              <Button
                bsstyle="danger"
                bssize="small"
                onClick={this.toggleTransaction}
              >
                Show More
              </Button>
            </div>
          
    )
}
}

render(){
    
    const {timestamp,hash}=this.props.block
    const hashDisplay=`${hash.substring(0,15)}...`
    
    
    return(
        <div className="block">
            <div>timestamp:{new Date(timestamp).toLocaleString()}</div>
            <div>Hash:{hashDisplay}</div>
            {this.displayTransactions}
           </div> 
    )
}
}
export default Block