import React from 'react'
import ItemsIndex from './ItemsIndex'

export default function Estudiantes() {
  return <ItemsIndex title="Estudiantes" endpoint="/item-estudiantes?populate=*" />
}
