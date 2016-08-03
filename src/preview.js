import React from 'react'

class Preview extends React.Component {
    render() {
        return (
            <div class="preview">
                <h3>
                    <a href={this.props.doc.url} target="_blank">
                        {this.props.doc.title}
                    </a>
                    ({this.props.doc.collection})
                </h3>
                <div className="preview-content">
                    <span dangerouslySetInnerHTML={{__html: this.props.doc.text}}/>
                </div>
            </div>
        )
    }
}

export default Preview
