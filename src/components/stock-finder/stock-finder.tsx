import { AV_API_KEY } from '../../global/global'
import { Component, State, Event, EventEmitter } from '@stencil/core'

@Component({
  tag: 'uc-stock-finder',
  styleUrl: './stock-finder.css',
  shadow: true
})
export class StockFinder {
  stockNameInput: HTMLInputElement

  @State() searchResults: { symbol: string; name: string }[] = []
  @State() loading = false

  @Event({ bubbles: true, composed: true }) ucSymbolSelected: EventEmitter<
    string
  >

  onFindStocks(event: Event) {
    event.preventDefault()
    this.loading = true
    const stockName = this.stockNameInput.value
    const endpoint = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`
    fetch(endpoint)
      .then(res => res.json())
      .then(parsedRes => {
        this.searchResults = parsedRes['bestMatches'].map(match => {
          return { name: match['2. name'], symbol: match['1. symbol'] }
        })
        this.loading = false
      })
      .catch(err => {
        console.log(err)
        this.loading = false
      })
  }

  onSelectSymbol(symbol: string) {
    this.ucSymbolSelected.emit(symbol)
  }

  render() {
    let content = (
      <ul>
        {this.searchResults.map(result => (
          <li onClick={this.onSelectSymbol.bind(this, result.symbol)}>
            <strong>{result.symbol}</strong> - {result.name}
          </li>
        ))}
      </ul>
    )

    if (this.loading) {
      content = <uc-spinner />
    }
    return [
      <form onSubmit={this.onFindStocks.bind(this)}>
        <input id="stock-symbol" ref={el => (this.stockNameInput = el)} />
        <button type="submit">Fetch</button>
      </form>,
      content
    ]
  }
}
