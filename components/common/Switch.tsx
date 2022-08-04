import { useState, FC, ReactNode } from 'react'

export interface ISelectProps {
  options: string[]
  handler?: (selected: string) => unknown
}

export const Select: FC<ISelectProps> = ({ options, handler }: ISelectProps) => {
  const [selected, setSelected] = useState<string>('')
  
  const changeSelected = (e: MouseEvent): void => {
    if (!e.target) return

    const { id } = e.target as HTMLDivElement
    
    setSelected(id)
    
    if (handler) handler(id)
  }

  const mapOptions = (): ReactNode => (
    options.map((option) =>
      <div
        key={option}
        id={option}
        className='select-option'
        onClick={(e) => changeSelected}
        role='option'
        aria-selected={option === selected}
      >
        {option}
      </div>
    )
  )

  return (
    <div className='select-container'>
      <div className='select-option select-selected' role='option' aria-selected={true}>
        {selected}
      </div>
      <div className='select-list'>
        {mapOptions()}
      </div>
    </div>
  )
}
