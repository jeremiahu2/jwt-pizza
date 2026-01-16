# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       |    Frontend component     | Backend endpoints  |   Database SQL   |
| --------------------------------------------------- | ------------------------- | -------------------| ------------------|
| View home page                                      |  home.tsx                 | none                | none             |
| Register new user<br/>(t@jwt.com, pw: test)         |  register.tsx             | POST /api/auth      | INSERT INTO user, INSERT INTO userRole |
| Login new user<br/>(t@jwt.com, pw: test)            |  login.tsx                | PUT /api/auth       | SELECT FROM user, SELECT FROM userRole, INSERT INTO auth |
| Order pizza                                         |  payment.tsx              | POST /api/order     | INSERT INTO dinerOrder, INSERT INTO orderItem |
| Verify pizza                                        |  delivery.tsx             | POST /api/order/verify | none         |
| View profile page                                   |  dinerDashboard           | /api/user/me        | SELECT FROM user, SELECT FROM userRole |
| View franchise<br/>(as diner)                       |  franchiseDashboard.tsx   | /api/franchise | SELECT FROM franchise, SELECT FROM store |
| Logout                                              |  logout.tsx               | DELETE /api/auth    | DELETE FROM auth |
| View About page                                     |  about.tsx                | none                | none         |
| View History page                                   |  history.tsx              | none                | none         |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) |  login.tsx                | PUT /api/auth       | SELECT FROM user, INSERT INTO auth |
| View franchise<br/>(as franchisee)                  |  franchiseDashboard.tsx   | /api/franchise?page=${page}&limit=${limit}&name=${nameFilter} | SELECT FROM franchise, SELECT FROM store |
| Create a store                                      |  createStore.tsx          | POST /api/franchise/:franchiseId/store | INSERT INTO store |
| Close a store                                       |  closeStore.tsx           | DELETE /api/franchise/:franchiseId/store/:storeId | DELETE FROM store |
| Login as admin<br/>(a@jwt.com, pw: admin)           |  login.tsx                | PUT /api/auth       | SELECT FROM user, INSERT INTO auth |
| View Admin page                                     |  adminDashboard.tsx       | GET /api/franchise  | SELECT FROM franchise |
| Create a franchise for t@jwt.com                    |  createFranchise.tsx      | POST /api/franchise | INSERT INTO franchise, INSERT INTO userRole |
| Close the franchise for t@jwt.com                   |  closeFranchise.tsx       | DELETE /api/franchise/:franchiseId | DELETE FROM store, DELETE FROM userRole, DELETE FROM franchise |
