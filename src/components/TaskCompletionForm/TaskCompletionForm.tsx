import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useTelegram } from '../../hooks/useTelegram'
import './TaskCompletionForm.css'

interface IMyTasks {
    id: number
    needTo: number
    price: number
    remote: boolean
    priority: number
    assortName: string
    stageName: string
    made: number
    defect: number
    refuse: boolean
}

const TaskCompletionForm = () => {
    const { tg } = useTelegram()
    const [search, setSearch] = useSearchParams();
    const [listTasks, setListTasks] = useState<IMyTasks[]>([])
    const [task, setTask] = useState<IMyTasks>({} as IMyTasks)
    const tasks = search.get('tasks');
    const [taskId, setTaskId] = useState<number>(0)

    const checkData = () => {
        for (const itemTask of listTasks ) {
            if (itemTask.refuse) return true
            const made = itemTask.made ? itemTask.made : 0
            const defect = itemTask.defect ? itemTask.defect : 0
            if (itemTask.needTo && (made + defect) >= itemTask.needTo) return true
        }
        return false
    }

    function onChangeTasks(e: { target: { value: any } }) {
        setTaskId(Number(e.target.value))
    }

    function onChangeMade(e: { target: { value: any } }) {
        setListTasks(listTasks.map(v => {
            if (v.id === taskId) {
                const temp = Number(e.target.value)
                v.made = temp > 0 && !isNaN(temp) ? temp : 0
                return v
            } else {
                return v
            }
        }))
    }

    function onChangeDefect(e: { target: { value: any } }) {
        setListTasks(listTasks.map(v => {
            if (v.id === taskId) {
                const temp = Number(e.target.value)
                v.defect = temp > 0 && !isNaN(temp) ? temp : 0
                return v
            } else {
                return v
            }
        }))
    }

    function onChangeRefuseTask(e: { target: { id: any, checked: boolean } }) {
        setListTasks(listTasks.map(v => {
            if (v.id === taskId) {
                v.refuse = e.target.checked
                return v
            } else {
                return v
            }
        }))
    }

    const onSendData = useCallback(() => {
        tg.sendData(JSON.stringify({ tasks: listTasks }))
    }, [listTasks, tg])

    useEffect(() => {
        tg.MainButton.setParams({
            text: 'Отправить данные'
        })
        const list: IMyTasks[] = tasks ? JSON.parse(tasks) : []
        list.map(l => {
            l.made = 0
            l.defect = 0
            l.refuse = false
            return l
        })
        list.unshift({ id: 0, assortName: 'Выберите задачу', stageName: '', needTo: 0, price: 0, priority: 0, remote: false, made: 0, defect: 0, refuse: false })
        setListTasks(list)
    }, [])

    useEffect(() => {
        const temp = checkData()
        !temp ? tg.MainButton.hide() : tg.MainButton.show()
    }, [listTasks])

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData])

    useEffect(() => {
        setTask(listTasks.filter(l => l.id === taskId)[0])
    }, [taskId])

    return (
        <div className={"form"}>
            <select value={taskId} onChange={onChangeTasks} className={'select'}>
                {listTasks.map(task => (
                    <option key={task.id} value={task.id}>{`${task.assortName} [${task.stageName}]`}</option>
                ))}
            </select>
            <hr/>
            {taskId !== 0 && task && task.id === taskId
                ?
                <>
                    <p>Нужно было сделать {task.needTo}</p>
                    <div>
                        <input
                            className={'input'}
                            type="number"
                            placeholder={'Количество сделанных'}
                            value={task.made}
                            onChange={onChangeMade}
                            min={0}
                        />
                    </div>
                    <div>
                        <input
                            className={'input'}
                            type="number"
                            placeholder={'Количество брака'}
                            value={task.defect}
                            onChange={onChangeDefect}
                            min={0}
                        />
                    </div>
                    <div>
                        <input type='checkbox' className={'checkbox'} onChange={onChangeRefuseTask} checked={task.refuse}/>Освободить задачу
                    </div>
                </>
                :
                <p>Не выбрана задача</p>
            }
        </div>
    );

}

export default TaskCompletionForm