import React,{Component} from 'react';
import Block from './Block.js'
import {Link} from 'react-router-dom'


class Blocks extends Component{
    state={blocks:[]}

    componentDidMount(){
        fetch(`${document.location.origin}/api/blocks`).then(response=>response.json().then(data=>this.setState({blocks:data}))
        ).catch(error=>console.log(error))
    }
    render(){
        console.log("state",this.state)
        const blocks=this.state.blocks
        return(
           <div>   
            <div><Link to="/">Home</Link></div>
        <h3><b>Blocks:</b></h3> 
            <div>
            {
            this.state.blocks.map((block)=>{
                return(
                // <div key={block.hash} className="block">Hash: {block.hash}</div>
                <Block key={block.hash} block={block} />
                )
            })}   
            </div>  
        </div> 
        )
    }

}

export default Blocks