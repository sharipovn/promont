import React, { useState, useEffect, useMemo,useCallback } from 'react';
import { Modal, Spinner, Row, Col, Card } from 'react-bootstrap';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import { useI18n } from '../context/I18nProvider';
import { FaDownload } from "react-icons/fa6";
import HoverCountText from './HoverCountText'
import { CiCircleInfo } from "react-icons/ci";
import {formatDateTime} from '../utils/formatDateTime'
import { FaFolderClosed } from "react-icons/fa6";
import { SiCommerzbank } from "react-icons/si";
import { GrTechnology } from "react-icons/gr";
import { BiTask } from "react-icons/bi";
import { VscError } from "react-icons/vsc";
import { safeDownload } from '../utils/safeDownload';

import ChatMessaging from './ChatMessaging';
import { MdOutlineMarkEmailUnread } from "react-icons/md";






export default function ProjectTreeModal({ show, onHide, project }) {


  const [treeData, setTreeData] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showMessageModal, setShowMessageModal] = useState(false);


  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();
  const { returnTitle } = useI18n();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

const fetchProjectTreeData = useCallback(async () => {
  if (!project || !project.project_code) return;
  setLoading(true);
  try {
    const res = await axiosInstance.get(`/projects/special/${project.project_code}/`);
    setTreeData(transformProjectToTree(res.data));
    setSelectedInfo(res.data);
    setSelectedPath(res.data.full_id);
    setError('');
  } catch (err) {
    setError(returnTitle('tree.fetch_project_failed'));
  } finally {
    setLoading(false);
  }
}, [project, axiosInstance]);


    useEffect(() => {
      if (show) {
        fetchProjectTreeData();
      }
    }, [show, fetchProjectTreeData]);



const getNodeWithMessageIcon = useCallback((label, value) => (
  <div className="d-flex justify-content-between align-items-center gap-2 w-100">
    <div className="text-truncate">{label}</div>
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectedInfo(value);
        setSelectedPath(value.full_id);
        setShowMessageModal(true);
      }}
      className="position-relative text-info"
      style={{ cursor: 'pointer' }}
    >
      <MdOutlineMarkEmailUnread className="ms-4 text-primary shadow" size="1.2rem" />
      {value.message_count > 0 && (
        <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
          {value.message_count}
        </span>
      )}
    </div>
  </div>
), []);



const transformProjectToTree = useCallback((data) => {
  return {
    name: getNodeWithMessageIcon(
      <>
        <FaFolderClosed className="me-1 text-warning" /> {data.project_name}
      </>,
      data
    ),
    value: { ...data, path_type: 'PROJECT' },
    full_id: data.full_id,
    children: data.finance_parts.map((fs) => ({
      name: getNodeWithMessageIcon(
        <>
          <SiCommerzbank className="me-1 text-warning" /> {fs.fs_part_no} — {fs.fs_part_name}
        </>,
        fs
      ),
      value: { ...fs, path_type: 'FIN_PART' },
      full_id: fs.full_id,
      children: fs.gip_parts.map((tch) => ({
        name: getNodeWithMessageIcon(
          <>
            <GrTechnology className="me-1 text-warning" /> {tch.tch_part_no} — {tch.tch_part_name}
          </>,
          tch
        ),
        value: { ...tch, path_type: 'TECH_PART' },
        full_id: tch.full_id,
        children: tch.work_orders.map((wo) => ({
          name: getNodeWithMessageIcon(
            <>
              <BiTask className="me-1 text-warning" /> {wo.wo_no} — {wo.wo_name}
            </>,
            wo
          ),
          value: { ...wo, path_type: 'WORK_ORDER' },
          full_id: wo.full_id
        }))
      }))
    }))
  };
}, [getNodeWithMessageIcon]);


const updateTreeMessageCount = useCallback((node, fullId) => {
  if (!node) return node;

  if (node.full_id === fullId) {
    const updatedValue = {
      ...node.value,
      message_count: (node.value.message_count || 0) + 1,
    };
    return {
      ...node,
      value: updatedValue,
      name: getNodeWithMessageIcon(
        <>
          {updatedValue.path_type === 'PROJECT' && (
            <>
              <FaFolderClosed className="me-1 text-warning" /> {updatedValue.project_name}
            </>
          )}
          {updatedValue.path_type === 'FIN_PART' && (
            <>
              <SiCommerzbank className="me-1 text-warning" /> {updatedValue.fs_part_no} — {updatedValue.fs_part_name}
            </>
          )}
          {updatedValue.path_type === 'TECH_PART' && (
            <>
              <GrTechnology className="me-1 text-warning" /> {updatedValue.tch_part_no} — {updatedValue.tch_part_name}
            </>
          )}
          {updatedValue.path_type === 'WORK_ORDER' && (
            <>
              <BiTask className="me-1 text-warning" /> {updatedValue.wo_no} — {updatedValue.wo_name}
            </>
          )}
        </>,
        updatedValue
      )

    };
  }

  if (node.children) {
    return {
      ...node,
      children: node.children.map((child) =>
        updateTreeMessageCount(child, fullId)
      ),
    };
  }

  return node;
}, [getNodeWithMessageIcon]);



  const renderTree = (node, level = 0) => {
    const isActive = selectedPath === node.full_id;
    return (
      <ul className="tree-node mt-1">
        <li>
          <div
            className={`tree-label ${isActive ? 'selected-tree-label' : ''}`}
            onClick={() => {
              setSelectedInfo(node.value);
              setSelectedPath(node.full_id);
            }}
          >
            {node.name}
          </div>
          {node.children && node.children.map((child, idx) => (
            <li key={idx}>{renderTree(child, level + 1)}</li>
          ))}
        </li>
      </ul>
    );
  };

  const labelMap = {
    project_code: returnTitle('tree.project_code'),
    project_name: returnTitle('tree.project_name'),
    start_date: returnTitle('tree.p_start_date'),
    end_date: returnTitle('tree.p_end_date'),
    total_price: returnTitle('tree.p_total_price'),
    create_date: returnTitle('tree.p_created'),
    create_user: returnTitle('project.created_by'),
    financier: returnTitle('project.financier'),
    p_gip_fio: returnTitle('tree.p_gip_fio'),
    full_id: returnTitle('tree.full_id'),
    fs_part_code: returnTitle('tree.fs_part_code'),
    fs_part_no: returnTitle('tree.fs_part_no'),
    fs_part_name: returnTitle('tree.fs_part_name'),
    fs_part_price: returnTitle('tree.fs_part_price'),
    fs_start_date: returnTitle('tree.fs_start_date'),
    fs_finish_date: returnTitle('tree.fs_finish_date'),
    fs_create_user:returnTitle('tree.fs_create_user'),
    tch_part_code: returnTitle('tech.code'),
    tch_part_no: returnTitle('tree.tch_part_no'),
    tch_part_name: returnTitle('tree.tch_part_name'),
    tch_part_nach: returnTitle('tree.tch_part_nach'),
    tch_start_date: returnTitle('tree.tch_start_date'),
    tch_finish_date: returnTitle('tree.tch_finish_date'),
    tech_create_user:returnTitle('tree.tech_create_user'),
    wo_id: returnTitle('tree.wo_id'),
    wo_no: returnTitle('tree.wo_no'),
    wo_name: returnTitle('tree.wo_name'),
    wo_start_date: returnTitle('tree.wo_start'),
    wo_finish_date: returnTitle('tree.wo_finish'),
    staff_confirm: returnTitle('tree.wo_confirmed'),
    files: returnTitle('tree.wo_files'),
    wo_answer:returnTitle('tree.wo_answer'),
    wo_remark:returnTitle('tree.wo_remark'),
    wo_staff_fio:returnTitle('tree.wo_staff_fio'),
    last_status: returnTitle('tree.last_status'),
    p_create_user_fio:returnTitle('tree.p_create_user_fio'),
    p_financier_fio:returnTitle('tree.p_financier_fio'),
    path_type:returnTitle('tree.obj_type'),
  };

  const renderInfoCard = (info) => {
    if (!info) return null;
    const fieldsToShow = {
      PROJECT: ['project_name', 'start_date', 'end_date', 'total_price', 'create_date','p_gip_fio','p_create_user_fio','p_financier_fio','full_id','last_status','path_type'],
      FIN_PART: ['fs_part_no', 'fs_part_name', 'fs_part_price', 'fs_start_date', 'fs_finish_date','fs_create_user','full_id','last_status','path_type'],
      TECH_PART: ['tch_part_no', 'tch_part_name', 'tch_part_nach', 'tch_start_date', 'tch_finish_date','tech_create_user', 'full_id','last_status','path_type'],
      WORK_ORDER: ['wo_no', 'wo_name', 'wo_start_date', 'wo_finish_date', 'staff_confirm', 'wo_answer','wo_remark','wo_staff_fio','full_id', 'files', 'last_status','path_type']
    };
    const pathType = info.path_type;
    const fields = fieldsToShow[pathType] || Object.keys(info);

    return (
      <Card style={{ backgroundColor: '#292940' }} className="text-light p-3">
        <Card.Title className="text-info"><CiCircleInfo/>{' '}{returnTitle('app.details')}</Card.Title>
        <div className="small mt-4">
          {fields.map((key) => {
            const value = info[key];
            if (key === 'files' && Array.isArray(value)) {
              return (
                <div key={key} className="d-flex border-bottom py-1">
                  <div className="text-secondary" style={{ width: '40%' }}>{labelMap[key]}:</div>
                  <div className="text-light" style={{ width: '60%' }}>
                    {value.length === 0 ? '—' : value.map((file, i) => (
                      <div key={i}>
                        <a
                            href={file.file}
                            download
                            onClick={(e) => safeDownload(e, file.file, returnTitle)}
                            className="text-info text-decoration-underline d-inline-flex align-items-center gap-1"
                          >
                            <FaDownload />
                            <HoverCountText maxWidth="80%">{file.original_name}</HoverCountText>
                          </a>

                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (key === 'last_status' && typeof value === 'object' && value !== null) {
              return (
                <div key={key} className="d-flex border-bottom py-1">
                  <div className="text-secondary" style={{ width: '40%' }}>{labelMap[key]}:</div>
                  <div className="text-light" style={{ width: '60%' }}>
                    <div>{returnTitle('tree.action')}:{' '}{value.latest_action}</div>
                    {/* <div>{returnTitle('tree.phase')}:{value.latest_phase_type}</div> */}
                    <div>{returnTitle('tree.updated')}:{' '}{formatDateTime(value.last_updated)}</div>
                    <div>{returnTitle('tree.updated_by')}: {' '}{value.updated_by}</div>
                  </div>
                </div>
              );
            }

            return (
              <div key={key} className="d-flex border-bottom py-1" style={{ fontSize: '0.85rem' }}>
                <div className="text-secondary" style={{ width: '40%' }}>{labelMap[key] || key}:</div>
                <div className="text-light text-break" style={{ width: '60%' }}>
                  <HoverCountText maxWidth="80%">
                    {key === 'path_type'
                      ? returnTitle(`obj.${String(value).toLowerCase()}`).toUpperCase()
                      : value !== null && value !== undefined
                      ? String(value)
                      : '—'}
                  </HoverCountText>

                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <Modal show={show} className='border-0 rounded' onHide={onHide} size="xl" centered backdrop="static">
      <Modal.Header className='text-light' style={{ backgroundColor: '#3e4d67' }} closeButton>
        <Modal.Title className=''>{project?.project_name} — {returnTitle('app.project_tree')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='tiny-scrollbar border-0 rounded' style={{ maxHeight: '80vh', overflowY: 'auto', backgroundColor: '#3e4d67', color: 'white' }}>
        {error && (
            <Alert
              type="danger"
              message={
                <span className="d-flex align-items-center gap-2">
                  <VscError /> {error}
                </span>
              }
            />
          )}
        {loading && (
            <div className="text-center py-3">
              <Spinner animation="border" variant="info" />
              <div className="text-light mt-2 small">
                {returnTitle('tree.loading_project')}...
              </div>
            </div>
          )}
        {!loading && !error && treeData && (
          <Row className="h-100">
            <Col md={6} style={{ fontFamily: 'monospace', lineHeight: 1.5 }}>
                {renderTree(treeData)}
            </Col>
            <Col md={6} className="d-flex align-items-center justify-content-center">
                <div className="shadow w-100">{renderInfoCard(selectedInfo)}</div>
            </Col>
            </Row>
        )}
      </Modal.Body>
      <ChatMessaging
          show={showMessageModal}
          onHide={() => {
            setShowMessageModal(false);
            if (selectedInfo) {
              setSelectedInfo((prev) =>
                prev ? { ...prev, message_count: (prev.message_count || 0) + 1 } : prev
              );
              setTreeData((prevTree) =>
                updateTreeMessageCount(prevTree, selectedInfo.full_id)
              );
            }
          }}
          item={selectedInfo}
        />

    </Modal>
    
  );
}
