// ==============================================================================
// MathMaster THCS - Bộ Kiểm Thử Phân Luồng Admin Quản Trị Học Viên (12/12 PASS)
// Kiểm tra toàn diện phân luồng tương tự Tuyển Dụng IT
// ==============================================================================

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NextRequest } from 'next/server';

import {
  clearAllRateLimitsForTesting,
  hashPassword,
  signSessionToken,
} from '../src/lib/auth';
import { readServerStateAsync, writeServerStateAsync } from '../src/lib/prisma';
import { GET as studentsGET, POST as studentsPOST } from '../src/app/api/admin/students/route';
import {
  GET as studentDetailGET,
  PUT as studentDetailPUT,
  DELETE as studentDetailDELETE,
} from '../src/app/api/admin/students/[id]/route';
import { POST as banPOST } from '../src/app/api/admin/students/[id]/ban/route';
import { POST as unbanPOST } from '../src/app/api/admin/students/[id]/unban/route';
import { POST as resetPasswordPOST } from '../src/app/api/admin/students/[id]/reset-password/route';
import { POST as restorePOST } from '../src/app/api/admin/students/[id]/restore/route';
import { POST as bulkPOST } from '../src/app/api/admin/students/bulk/route';
import { GET as logsGET } from '../src/app/api/admin/logs/route';
import { POST as authPOST } from '../src/app/api/auth/route';
import { POST as adminAuthPOST, GET as adminAuthGET } from '../src/app/api/admin/auth/route';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const localStatePath = path.join(rootDir, '.data', 'local_db_state.json');

function makeReq(url, { method = 'GET', body, cookieToken, ip = '127.0.0.1' } = {}) {
  const headers = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': ip,
    'user-agent': 'Admin-Test-Runner/1.0',
  });
  if (cookieToken) {
    headers.set('cookie', `mm_session=${cookieToken}`);
  }
  return new NextRequest(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function runAdminStudentTests() {
  console.log('================================================================');
  console.log('🛡️ BẮT ĐẦU KIỂM THỬ PHÂN LUỒNG ADMIN QUẢN TRỊ HỌC VIÊN');
  console.log('================================================================');

  const originalState = await readServerStateAsync();
  const savedStateBackup = JSON.parse(JSON.stringify(originalState));

  try {
    // 1. Chuẩn bị tài khoản Admin và Học viên mẫu
    const state = originalState;
    const adminUser = (state.users || []).find((u) => u.role === 'ADMIN');
    assert.ok(adminUser, 'Cần có ít nhất một tài khoản ADMIN trong state');
    adminUser.passwordHash = hashPassword('AdminPass@123');

    const studentUser = (state.users || []).find((u) => u.role === 'STUDENT');
    assert.ok(studentUser, 'Cần có ít nhất một tài khoản STUDENT trong state');
    studentUser.passwordHash = hashPassword('StudentPass@123');

    // Tạo token cho Admin và Student
    const adminSessionId = `sess_admin_${crypto.randomUUID()}`;
    const studentSessionId = `sess_student_${crypto.randomUUID()}`;

    state.sessions = state.sessions || [];
    state.sessions.push({
      id: adminSessionId,
      userId: adminUser.id,
      deviceName: 'Chrome Admin',
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
    state.sessions.push({
      id: studentSessionId,
      userId: studentUser.id,
      deviceName: 'Mobile Student',
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });

    await writeServerStateAsync(state);

    const adminToken = signSessionToken({
      userId: adminUser.id,
      role: 'ADMIN',
      isGuest: false,
      sessionId: adminSessionId,
    });

    const studentToken = signSessionToken({
      userId: studentUser.id,
      role: 'STUDENT',
      isGuest: false,
      sessionId: studentSessionId,
    });

    // Test 1: Chặn truy cập khi chưa đăng nhập (401)
    const reqUnauth = makeReq('http://localhost:3000/api/admin/students');
    const resUnauth = await studentsGET(reqUnauth);
    assert.equal(resUnauth.status, 401, 'Chưa đăng nhập phải nhận mã lỗi 401');
    console.log('✓ [PASS] (1) Chặn truy cập API Admin khi chưa đăng nhập (401)');

    // Test 2: Chặn tài khoản STUDENT truy cập phân luồng Admin (403)
    const reqStudent = makeReq('http://localhost:3000/api/admin/students', { cookieToken: studentToken });
    const resStudent = await studentsGET(reqStudent);
    assert.equal(resStudent.status, 403, 'Tài khoản STUDENT truy cập Admin phải nhận 403');
    console.log('✓ [PASS] (2) Bảo vệ phân luồng: Chặn STUDENT truy cập API Quản trị Admin (403)');

    // Test 3: Cho phép ADMIN xem danh sách học viên kèm bộ lọc và thống kê
    const reqAdminList = makeReq('http://localhost:3000/api/admin/students?limit=5', { cookieToken: adminToken });
    const resAdminList = await studentsGET(reqAdminList);
    assert.equal(resAdminList.status, 200, 'ADMIN phải truy cập thành công 200');
    const listData = await resAdminList.json();
    assert.equal(listData.ok, true);
    assert.ok(Array.isArray(listData.students), 'Phải trả về mảng students');
    assert.ok(listData.summary, 'Phải có thống kê tổng quan summary');
    assert.ok(listData.pagination, 'Phải có dữ liệu phân trang pagination');
    console.log(`✓ [PASS] (3) ADMIN truy xuất danh sách học viên thành công (Tổng: ${listData.summary.totalAll})`);

    // Test 4: Thêm mới học viên & tự động sinh mật khẩu tạm thời
    const newStudentEmail = `test_hocvien_${Date.now()}@mathmaster.vn`;
    const newStudentUsername = `test_hv_${Date.now()}`;
    const reqCreate = makeReq('http://localhost:3000/api/admin/students', {
      method: 'POST',
      cookieToken: adminToken,
      body: {
        fullName: 'Học Viên Thử Nghiệm',
        email: newStudentEmail,
        username: newStudentUsername,
        currentGrade: 8,
        preferredBook: 'KNTT',
        schoolName: 'THCS Thử Nghiệm',
      },
    });
    const resCreate = await studentsPOST(reqCreate);
    assert.equal(resCreate.status, 200);
    const createData = await resCreate.json();
    assert.equal(createData.ok, true);
    assert.ok(createData.student?.id);
    assert.ok(createData.tempPassword, 'Phải sinh mật khẩu tạm thời');
    assert.ok(createData.tempPassword.startsWith('Math@'), 'Mật khẩu tạm phải có tiền tố Math@');
    const createdId = createData.student.id;
    const tempPass = createData.tempPassword;
    console.log(`✓ [PASS] (4) Thêm mới học viên thành công kèm mật khẩu tạm: ${tempPass}`);

    // Test 5: Xem chi tiết học viên & thống kê học tập
    const reqDetail = makeReq(`http://localhost:3000/api/admin/students/${createdId}`, { cookieToken: adminToken });
    const resDetail = await studentDetailGET(reqDetail, { params: { id: createdId } });
    assert.equal(resDetail.status, 200);
    const detailData = await resDetail.json();
    assert.equal(detailData.ok, true);
    assert.equal(detailData.student.fullName, 'Học Viên Thử Nghiệm');
    assert.ok(Array.isArray(detailData.auditLogs), 'Phải trả về mảng auditLogs');
    assert.ok(detailData.auditLogs.some((l) => l.action === 'student.create'), 'Phải có log student.create');
    console.log('✓ [PASS] (5) Xem chi tiết học viên & kiểm tra liên kết Audit Logs thành công');

    // Test 6: Chỉnh sửa thông tin học viên (Họ tên, khối lớp, trường)
    const reqEdit = makeReq(`http://localhost:3000/api/admin/students/${createdId}`, {
      method: 'PUT',
      cookieToken: adminToken,
      body: {
        fullName: 'Học Viên Đã Cập Nhật',
        currentGrade: 9,
        preferredBook: 'CD',
        schoolName: 'THCS Giảng Võ',
      },
    });
    const resEdit = await studentDetailPUT(reqEdit, { params: { id: createdId } });
    assert.equal(resEdit.status, 200);
    const editData = await resEdit.json();
    assert.equal(editData.ok, true);
    assert.equal(editData.student.fullName, 'Học Viên Đã Cập Nhật');
    assert.equal(editData.student.currentGrade, 9);
    console.log('✓ [PASS] (6) Chỉnh sửa thông tin học viên & ghi nhận Audit Log thành công');

    // Test 7: Khóa tài khoản học viên (yêu cầu lý do bắt buộc) & kiểm tra chặn đăng nhập
    const reqBanNoReason = makeReq(`http://localhost:3000/api/admin/students/${createdId}/ban`, {
      method: 'POST',
      cookieToken: adminToken,
      body: { reason: '' },
    });
    const resBanNoReason = await banPOST(reqBanNoReason, { params: { id: createdId } });
    assert.equal(resBanNoReason.status, 400, 'Khóa không có lý do phải bị từ chối 400');

    const banReason = 'Vi phạm quy chế phòng thi trực tuyến';
    const reqBan = makeReq(`http://localhost:3000/api/admin/students/${createdId}/ban`, {
      method: 'POST',
      cookieToken: adminToken,
      body: { reason: banReason },
    });
    const resBan = await banPOST(reqBan, { params: { id: createdId } });
    assert.equal(resBan.status, 200);

    // Kiểm tra học viên bị khóa không thể đăng nhập
    clearAllRateLimitsForTesting();
    const reqLoginBanned = makeReq('http://localhost:3000/api/auth', {
      method: 'POST',
      body: {
        action: 'login',
        identifier: newStudentEmail,
        password: tempPass,
      },
    });
    const resLoginBanned = await authPOST(reqLoginBanned);
    assert.equal(resLoginBanned.status, 403, 'Tài khoản bị khóa phải bị từ chối đăng nhập với 403');
    const loginBannedData = await resLoginBanned.json();
    assert.ok(loginBannedData.error.includes(banReason), 'Thông báo lỗi phải hiển thị lý do khóa');
    console.log('✓ [PASS] (7) Khóa tài khoản (bắt buộc lý do) & chặn đăng nhập 403 chính xác');

    // Test 8: Mở khóa tài khoản học viên & cho phép đăng nhập lại
    const reqUnban = makeReq(`http://localhost:3000/api/admin/students/${createdId}/unban`, {
      method: 'POST',
      cookieToken: adminToken,
    });
    const resUnban = await unbanPOST(reqUnban, { params: { id: createdId } });
    assert.equal(resUnban.status, 200);

    // Kiểm tra đăng nhập lại thành công
    clearAllRateLimitsForTesting();
    const reqLoginUnbanned = makeReq('http://localhost:3000/api/auth', {
      method: 'POST',
      body: {
        action: 'login',
        identifier: newStudentEmail,
        password: tempPass,
      },
    });
    const resLoginUnbanned = await authPOST(reqLoginUnbanned);
    assert.equal(resLoginUnbanned.status, 200, 'Sau khi mở khóa học viên phải đăng nhập được');
    console.log('✓ [PASS] (8) Mở khóa tài khoản & phục hồi quyền đăng nhập chính xác');

    // Test 9: Đặt lại mật khẩu tạm thời ngẫu nhiên
    const reqReset = makeReq(`http://localhost:3000/api/admin/students/${createdId}/reset-password`, {
      method: 'POST',
      cookieToken: adminToken,
    });
    const resReset = await resetPasswordPOST(reqReset, { params: { id: createdId } });
    assert.equal(resReset.status, 200);
    const resetData = await resReset.json();
    assert.ok(resetData.tempPassword);
    assert.notEqual(resetData.tempPassword, tempPass, 'Mật khẩu tạm mới phải khác mật khẩu cũ');

    // Mật khẩu cũ không đăng nhập được nữa
    clearAllRateLimitsForTesting();
    const reqLoginOld = makeReq('http://localhost:3000/api/auth', {
      method: 'POST',
      body: {
        action: 'login',
        identifier: newStudentEmail,
        password: tempPass,
      },
    });
    const resLoginOld = await authPOST(reqLoginOld);
    assert.equal(resLoginOld.status, 401, 'Mật khẩu cũ phải không còn tác dụng');

    // Mật khẩu mới đăng nhập được
    const reqLoginNew = makeReq('http://localhost:3000/api/auth', {
      method: 'POST',
      body: {
        action: 'login',
        identifier: newStudentEmail,
        password: resetData.tempPassword,
      },
    });
    const resLoginNew = await authPOST(reqLoginNew);
    assert.equal(resLoginNew.status, 200, 'Mật khẩu tạm mới phải đăng nhập thành công');
    console.log(`✓ [PASS] (9) Đặt lại mật khẩu tạm thời mới (${resetData.tempPassword}) & vô hiệu hóa mật khẩu cũ`);

    // Test 10: Thao tác hàng loạt (Bulk actions: Khóa & Mở khóa hàng loạt)
    const reqBulkBan = makeReq('http://localhost:3000/api/admin/students/bulk', {
      method: 'POST',
      cookieToken: adminToken,
      body: {
        action: 'ban',
        ids: [createdId],
        reason: 'Khóa hàng loạt phục vụ bảo trì dữ liệu',
      },
    });
    const resBulkBan = await bulkPOST(reqBulkBan);
    assert.equal(resBulkBan.status, 200);
    const bulkBanData = await resBulkBan.json();
    assert.equal(bulkBanData.affectedCount, 1);

    const reqBulkUnban = makeReq('http://localhost:3000/api/admin/students/bulk', {
      method: 'POST',
      cookieToken: adminToken,
      body: {
        action: 'unban',
        ids: [createdId],
      },
    });
    const resBulkUnban = await bulkPOST(reqBulkUnban);
    assert.equal(resBulkUnban.status, 200);
    console.log('✓ [PASS] (10) Thao tác hàng loạt (Bulk ban & bulk unban) hoạt động chính xác');

    // Test 11: Xóa mềm, khôi phục & xóa vĩnh viễn (Soft-delete & Hard-delete)
    // 11.a Xóa mềm
    const reqSoftDel = makeReq(`http://localhost:3000/api/admin/students/${createdId}`, {
      method: 'DELETE',
      cookieToken: adminToken,
    });
    const resSoftDel = await studentDetailDELETE(reqSoftDel, { params: { id: createdId } });
    assert.equal(resSoftDel.status, 200);

    // Tài khoản đã xóa mềm không thể đăng nhập
    clearAllRateLimitsForTesting();
    const reqLoginDeleted = makeReq('http://localhost:3000/api/auth', {
      method: 'POST',
      body: {
        action: 'login',
        identifier: newStudentEmail,
        password: resetData.tempPassword,
      },
    });
    const resLoginDeleted = await authPOST(reqLoginDeleted);
    assert.equal(resLoginDeleted.status, 403, 'Tài khoản đã xóa mềm phải bị chặn với 403');

    // 11.b Khôi phục tài khoản
    const reqRestore = makeReq(`http://localhost:3000/api/admin/students/${createdId}/restore`, {
      method: 'POST',
      cookieToken: adminToken,
    });
    const resRestore = await restorePOST(reqRestore, { params: { id: createdId } });
    assert.equal(resRestore.status, 200);

    // 11.c Xóa vĩnh viễn (permanent=true)
    const reqHardDel = makeReq(`http://localhost:3000/api/admin/students/${createdId}?permanent=true`, {
      method: 'DELETE',
      cookieToken: adminToken,
    });
    const resHardDel = await studentDetailDELETE(reqHardDel, { params: { id: createdId } });
    assert.equal(resHardDel.status, 200);

    // Kiểm tra không còn tồn tại trong DB
    const reqGetNonExistent = makeReq(`http://localhost:3000/api/admin/students/${createdId}`, { cookieToken: adminToken });
    const resGetNonExistent = await studentDetailGET(reqGetNonExistent, { params: { id: createdId } });
    assert.equal(resGetNonExistent.status, 404, 'Tài khoản xóa vĩnh viễn phải không tìm thấy (404)');
    console.log('✓ [PASS] (11) Vòng đời xóa: Xóa mềm, chặn đăng nhập, khôi phục & Xóa vĩnh viễn (404)');

    // Test 12: Nhật ký hệ thống / Audit Logs toàn diện
    const reqLogs = makeReq('http://localhost:3000/api/admin/logs?limit=50', { cookieToken: adminToken });
    const resLogs = await logsGET(reqLogs);
    assert.equal(resLogs.status, 200);
    const logsData = await resLogs.json();
    assert.equal(logsData.ok, true);
    assert.ok(Array.isArray(logsData.logs));
    assert.ok(logsData.logs.length >= 6, 'Phải có đầy đủ các bản ghi kiểm toán đã thực hiện');

    const recordedActions = new Set(logsData.logs.map((l) => l.action));
    assert.ok(recordedActions.has('student.create'), 'Phải ghi nhận student.create');
    assert.ok(recordedActions.has('student.update'), 'Phải ghi nhận student.update');
    assert.ok(recordedActions.has('student.ban'), 'Phải ghi nhận student.ban');
    assert.ok(recordedActions.has('student.unban'), 'Phải ghi nhận student.unban');
    assert.ok(recordedActions.has('student.resetPassword'), 'Phải ghi nhận student.resetPassword');
    assert.ok(recordedActions.has('student.softDelete'), 'Phải ghi nhận student.softDelete');
    assert.ok(recordedActions.has('student.restore'), 'Phải ghi nhận student.restore');
    assert.ok(recordedActions.has('student.hardDelete'), 'Phải ghi nhận student.hardDelete');
    console.log(`✓ [PASS] (12) Nhật ký kiểm toán hệ thống ghi nhận đầy đủ 8 loại hành động quản trị (Tổng: ${logsData.pagination.totalItems} logs)`);

    // Test 13: Cổng đăng nhập riêng biệt Quản trị viên (/api/admin/auth)
    // 13.a Học viên đăng nhập vào cổng Admin bị từ chối 403
    clearAllRateLimitsForTesting();
    const reqStudentInAdminPortal = makeReq('http://localhost:3000/api/admin/auth', {
      method: 'POST',
      body: {
        action: 'login',
        identifier: studentUser.email,
        password: 'StudentPass@123',
      },
    });
    const resStudentInAdminPortal = await adminAuthPOST(reqStudentInAdminPortal);
    assert.equal(resStudentInAdminPortal.status, 403, 'Học sinh đăng nhập vào cổng Admin phải bị chặn 403');
    const studentInAdminData = await resStudentInAdminPortal.json();
    assert.ok(studentInAdminData.error.includes('ADMIN'), 'Thông báo phải ghi rõ chỉ dành cho ADMIN');

    // 13.b Admin đăng nhập thành công vào cổng Admin
    clearAllRateLimitsForTesting();
    const reqAdminLoginPortal = makeReq('http://localhost:3000/api/admin/auth', {
      method: 'POST',
      body: {
        action: 'login',
        identifier: adminUser.email,
        password: 'AdminPass@123',
      },
    });
    const resAdminLoginPortal = await adminAuthPOST(reqAdminLoginPortal);
    assert.equal(resAdminLoginPortal.status, 200, 'Admin đăng nhập cổng riêng phải thành công 200');
    const adminPortalData = await resAdminLoginPortal.json();
    assert.equal(adminPortalData.ok, true);
    assert.equal(adminPortalData.user.role, 'ADMIN');

    // 13.c Đăng xuất khỏi cổng Admin
    const reqAdminLogout = makeReq('http://localhost:3000/api/admin/auth', {
      method: 'POST',
      body: { action: 'logout' },
    });
    const resAdminLogout = await adminAuthPOST(reqAdminLogout);
    assert.equal(resAdminLogout.status, 200);
    console.log('✓ [PASS] (13) Cổng đăng nhập riêng Admin: Chặn học sinh 403, cho phép Admin 200 & Đăng xuất an toàn');

    console.log('================================================================');
    console.log('🎉 TẤT CẢ 13 BÀI KIỂM THỬ QUẢN TRỊ HỌC VIÊN ĐỀU ĐẠT (13/13 PASS)!');
    console.log('================================================================');
  } finally {
    // Khôi phục lại trạng thái ban đầu của state
    if (savedStateBackup) {
      await writeServerStateAsync(savedStateBackup);
    }
  }
}

// Cho phép chạy độc lập: npx tsx scripts/test-admin-students.mjs
if (process.argv[1] && process.argv[1].endsWith('test-admin-students.mjs')) {
  runAdminStudentTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ LỖI KIỂM THỬ:', err);
      process.exit(1);
    });
}
