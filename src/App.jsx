import { useState, useEffect, useRef } from 'react'
import { useDebounce } from './custom hooks/useDebounce'
import './App.css'

function App() {
  const [value, setValue] = useState('')
  const [data, setData] = useState([])

  
  const debouncedValue = useDebounce(value, 1000)


  useEffect(() => {
    if(debouncedValue){
      fetchData(debouncedValue)
    }
  }, [debouncedValue])

  async function fetchData(q) {
    try {
      const res = await fetch(`https://api.github.com/search/users?q=${q}`)
      if(!res.ok) {
        throw new Error(`fetch failed ${res.status} & ${res.statusText}`)
      }
      const result = await res.json()
      console.log(result.items[0])
      setData(result)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <input 
      className='border flex gap-1 items-center rounded-xl px-2' 
      type="text" 
      onChange={e => setValue(e.target.value)}
      placeholder='Search users' />
      {debouncedValue && <p className='border rounded-xl w-1/2 p-2'>{data.items.map( item =>{
        return (
          <div className='flex items-center justify-center gap-1 border rounded-xl px-2 mt-1' key={item.id}>
            <img className='absolute ml-5 left-0 w-5 h-5 rounded-full' src={item.avatar_url} alt={item.login} />
            <p className='' >
              <a href={item.html_url} target='_blank'>{item.login}</a>
            </p>
          </div>
        )
      })}</p>}
    </>
  )
}

export default App
