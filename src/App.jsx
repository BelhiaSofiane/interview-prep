import { useState, useEffect, useRef } from 'react'
import { useDebounce } from './custom hooks/useDebounce'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [error, setError] = useState(null) // null | string
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [ActiveIndex, setActiveIndex] = useState(-1)
  const [data, setData] = useState([])


  const containerRef = useRef(null)
  const itemRefs = useRef([])
  const inputRef = useRef(null)

  useEffect(() => {
    // reset active index when data changes
    setActiveIndex(data.length ? 0 : -1)
  }, [data])

  useEffect(() => {
    if (ActiveIndex >= 0 && itemRefs.current[ActiveIndex]) {
      itemRefs.current[ActiveIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [ActiveIndex])

  function handleKeyStrokes(e) {
    if (!data.length) return

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => prev < data.length - 1 ? prev + 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        window.open(data[ActiveIndex].html_url, '_blank', 'noopener,noreferrer')
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(data.length - 1)
        break
      case 'Escape':
        e.preventDefault()
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
        setActiveIndex(-1)
      default:
        break
    }
  }

  const debouncedValue = useDebounce(query, 1000)


  useEffect(() => {
    if (debouncedValue) {
      fetchData(debouncedValue)
    }
  }, [debouncedValue])

  async function fetchData(q) {
    setStatus('loading')
    try {
      const res = await fetch(`https://api.github.com/search/users?q=${q}`)
      if (!res.ok) {
        throw new Error(`fetch failed ${res.status} & ${res.statusText}`)
      }
      const result = await res.json()
      setData(result.items)
      setStatus('success')
    } catch (e) {
      console.error(e)
      setStatus('error')
      setError(e.message)
    }
    // auto focuses on the list
  }

  return (
    <>
      <input
        ref={inputRef}
        className='border flex gap-1 items-center rounded-xl px-2'
        type="text"
        onChange={e => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' || e.key === 'ArrowDown' ? containerRef.current.focus() : null}
        placeholder='Search users' />
      {error && <div className='text-red-500' id='error-msg' role='alert' aria-live='assertive' aria-label='error'>{error}</div>}
      {status === 'loading' && <div role='status' aria-live='polite' aria-label='loading' >Loading...</div>}
      {debouncedValue && <div
        className='border rounded-xl w-1/2 p-2'
        ref={containerRef}
        role='listbox'
        aria-label='search results'
        onKeyDown={handleKeyStrokes}
        tabIndex={0}
        aria-activedescendant={
          ActiveIndex >= 0 && data[ActiveIndex]
            ? `result-${ActiveIndex}`
            : undefined
        }

      >{data.map((item, index) => {
        const isActive = index === ActiveIndex
        return (
          <div
            ref={(el) => (itemRefs.current[index] = el)}
            id={`result-${index}`}
            key={item.id}
            role='option'
            aria-selected={isActive}
            tabIndex={-1}
            className={'flex items-center justify-center gap-1 border rounded-xl px-2 mt-1 max-h-64 overflow-y-auto' +
              (isActive ? 'relative bg-gray-200 border-0' : '')
            }

          >
            <img
              className='absolute ml-5 left-0 w-5 h-5 rounded-full'
              src={item.avatar_url}
              alt={item.login} />
            <p className='' >
              <a href={item.html_url} target='_blank'>{item.login}</a>
            </p>
          </div>
        )
      })}</div>}
    </>
  )
}

export default App
