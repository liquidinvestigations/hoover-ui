import React from 'react';
import Dropdown from './dropdown.js';
import Navbar from './navbar.js';
import CollectionsBox from './collections-box.js';
import Search from './search.js';


const sizeOptions = [10, 50, 200, 1000];

class SearchPage extends React.Component {

    parseQuery(url) {
        var rv = {}
        if (url.indexOf('?') > -1) {
            url.match(/\?(.*)/)[1].split('&').forEach(function (pair) {
                var kv = pair.split('=').map(decodeURIComponent)
                var k = kv[0], v = kv[1]
                if (!rv[k]) {
                    rv[k] = []
                }
                rv[k].push(v)
            })
        }
        return rv
    }
    
    constructor(props) {
        super(props);
        var args = this.parseQuery(window.location.href);
        this.state = {
            q: args.q ? ("" + args.q).replace(/\+/g, ' ') : "",
            size: args.size ? +args.size : 10,
            args: args,
            collections: [],
            selectedCollections: [],
            query: null,
            page: '',
        }
    }

    componentDidMount() {
        $.get('/collections', function (resp) {
            var collections = resp;
            var selectedCollections = null;
            var query = null;
            var args = this.state.args;
            if (args.collections) {
                var sel = '' + args.collections;
                selectedCollections = sel ? sel.split('+') : [];
            }
            else {
                selectedCollections = resp.map(function (c) {
                    return c.name
                });
            }

            if (this.state.q) {
                query = {
                    q: this.state.q,
                    collections: selectedCollections,
                    page: args.p ? +args.p : 1,
                    size: this.state.size,
                }
            }

            this.setState({
                collections,
                selectedCollections,
                query,
            });
        }.bind(this));
    }

    render() {
        return (
            <form>
                <div className="row">
                    <div className="col-sm-3">
                        <h1>Hoover</h1>
                    </div>
                    <div className="col-sm-8">
                        <div className="form-group">
                            <input name="q" defaultValue={this.state.q}
                                   className="form-control"
                                   placeholder="query ..."/>
                        </div>
                        <div className="form-inline">
                            <div className="form-group">
                                <Dropdown values={sizeOptions}/>
                            </div>
                            <button type="submit" className="btn btn-primary btn-sm">search</button>
                            <p className="pull-sm-right">
                                <a href="/batch.html">batch search</a>
                            </p>
                        </div>
                    </div>
                    <div className="col-sm-1">
                        <Navbar />
                    </div>
                </div>
                <div className="row">
                    <CollectionsBox
                        collections={this.state.collections}
                        selected={this.state.selectedCollections}
                        onChanged={(selected) => this.setState({selectedCollections: selected})} />
                    <Search
                        query={this.state.query}
                        collections={this.state.selectedCollections} />
                </div>
            </form>
        )
    }
}

export default SearchPage;
