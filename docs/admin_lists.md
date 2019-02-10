See [Admin Wireframes](https://github.com/wgilpin/recruitment-ascee/blob/master/docs/Admin%20Wireframe.png)

# Kinds

A list of [x] against which things are checked

* Characters
* Types (for Items/Ships)
* Chat Channels
* Alliances
* Corps
* Regions
* Systems

For each list there’s an ID

I think all we need is a list of IDs and we check all IDs against the same list?

But for the UI we need ID & Kind so that's the db model

# APIs

GET    `/api/admin/list/<kind>`
PUT    `/api/admin/list/<kind>/add`
PUT    `/api/admin/list/<kind>/replace`
DELETE `/api/admin/list/<kind>/delete/<item_id>`


Kind is the list of [x] above as text

# RBAC

Only logged in admins

Any other request is forbidden






