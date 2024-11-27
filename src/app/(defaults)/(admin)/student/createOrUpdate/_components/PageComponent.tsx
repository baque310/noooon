"use client"

import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';

import useLogic from './_logic';
import { Tab } from './Tab';
import SingleAdd from './SingleAdd';
import MuiltAdd from './MuiltAdd';

const PageComponent = () => {
  const { t,
    isFetching: isFetching,
    id,
    selected,
    setSelected,
    data,
    studentSchema,
    handleSubmit,
    isLoadingStudentUpdate,
    studentSchemaMulti,
    handleSubmitMulti,
    isLoadingStudentCreateMulti

  } = useLogic();

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "StudentPage.update-info" : "StudentPage.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          !id ?
            <>
              <Tab
                selected={selected}
                setSelected={setSelected}
              />
              {
                selected == "add" ?
                  <SingleAdd

                    t={t}
                    data={data}
                    studentSchema={studentSchema}
                    handleSubmit={handleSubmit}
                    isLoadingStudentUpdate={isLoadingStudentUpdate}
                  /> :
                  <MuiltAdd

                    t={t}
                    studentSchemaMulti={studentSchemaMulti}
                    handleSubmitMulti={handleSubmitMulti}
                    isLoadingStudentCreateMulti={isLoadingStudentCreateMulti}
                  />
              }
            </>
            :
            <>
              <SingleAdd
                t={t}
                data={data}
                studentSchema={studentSchema}
                handleSubmit={handleSubmit}
                isLoadingStudentUpdate={isLoadingStudentUpdate}
              />
            </>

        )}
      </div>
    </>
  );
};

export default PageComponent

