import React, { useRef } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

const CreateUser = (props) => {
    const { createUser } = props
    const { visibleCreatUser } = props
    const nameRef = useRef("")
    const passwordRef = useRef("")
    const emailRef = useRef("")
    const phoneRef = useRef("")

    return (
        <Dialog
            visible={visibleCreatUser}
            modal
            onHide={() => { if (!visibleCreatUser) return; props.setVisibleCreatUser(false); }}
            content={({ hide }) => (
                <div className="flex flex-column px-8 py-5 gap-4" style={{ borderRadius: '12px', backgroundImage: 'radial-gradient(circle at left top, var(--primary-400), var(--primary-700))' }}>

                    <div className="inline-flex flex-column gap-2">
                        <label htmlFor="username" className="text-primary-50 font-semibold">
                            name
                        </label>
                        <InputText id="name" label="name" className="bg-white-alpha-20 border-none p-3 text-primary-50" type="name" ref={nameRef}></InputText>
                    </div>
                    <div className="inline-flex flex-column gap-2">
                        <label htmlFor="username" className="text-primary-50 font-semibold">
                            email
                        </label>
                        <InputText id="name" label="name" className="bg-white-alpha-20 border-none p-3 text-primary-50" ref={emailRef}></InputText>
                    </div>
                    <div className="inline-flex flex-column gap-2">
                        <label htmlFor="username" className="text-primary-50 font-semibold">
                            phone
                        </label>
                        <InputText id="name" label="name" className="bg-white-alpha-20 border-none p-3 text-primary-50" ref={phoneRef}></InputText>
                    </div>
                    <div className="inline-flex flex-column gap-2">
                        <label htmlFor="username" className="text-primary-50 font-semibold">
                            password
                        </label>
                        <InputText id="name" label="name" className="bg-white-alpha-20 border-none p-3 text-primary-50" ref={passwordRef}></InputText>
                    </div>
                    <div className="flex align-items-center gap-2">
                        <Button label="Creat" onClick={(e) => { createUser(nameRef, emailRef, phoneRef); hide(e) }} text className="p-3 w-full text-primary-50 border-1 border-white-alpha-30 hover:bg-white-alpha-10"></Button>
                        <Button label="Cancel" onClick={(e) => hide(e)} text className="p-3 w-full text-primary-50 border-1 border-white-alpha-30 hover:bg-white-alpha-10"></Button>
                    </div>
                </div>
            )}
        ></Dialog>
    )
}
export default CreateUser