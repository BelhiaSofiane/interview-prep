import { useState, useEffect } from 'react'
import { useDebounce } from './custom hooks/useDebounce'
import './App.css'

function App() {
  const [data, setData] = useState([])

  const debouncedValue = useDebounce(data, 300)

  const handleChange = (e) => {
    fetchData(e.target.value)
  }

  useEffect(() => {
    console.log(debouncedValue)
  }, [debouncedValue])

  async function fetchData(q) {
    try {
      const res = await fetch(`https://api.github.com/search/users?q=${q}`)
      if(!res.ok) {
        throw new Error(`fetch failed ${res.status} & ${res.statusText}`)
      }
      const result = await res.json()
      setData(result)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <input className='border' type="text" onChange={handleChange} />
      <p>{debouncedValue.total_count}</p>
    </>
  )
}

export default App
