(in-package :mu-cl-resources)

(defparameter *cache-count-queries* nil)
(defparameter *supply-cache-headers-p* t
  "when non-nil, cache headers are supplied.  this works together with mu-cache.")
(setf *cache-model-properties-p* t)
(defparameter *include-count-in-paginated-responses* t
  "when non-nil, all paginated listings will contain the number
   of responses in the result object's meta.")
(defparameter *max-group-sorted-properties* t)
(defparameter sparql:*experimental-no-application-graph-for-sudo-select-queries* t)

;; Read domain files
(read-domain-file "organisation.lisp")
(read-domain-file "concept-scheme.lisp")
(read-domain-file "master-users-domain.lisp")
(read-domain-file "lpdc.lisp")

;; Extra security layer to return 403 on GET /files
;; It should be ok for mu-auth; but devs can make bugs and add files to the wrong graph (i.e. public)
(before (:list file) (resource)
  (let ((request-filters-on-uri
          (some (lambda (args)
                  (let ((components (getf args :components)))

                    ;;matches /files?filter[data-container][input-from-tasks][:id:]=''
                    (or
                      (and (= 3 (length components))
                           (string= (elt components 2)
                                    ":id:"))

                     ;;matches /files?filter[:uri:]=''
                       (and (= 1 (length components))
                           (string= (elt components 0)
                                    ":uri:")))
                    ))
                (extract-filters-from-request))))
    (if request-filters-on-uri
        resource
        (error 'access-denied :operation :list :resource resource :id :none))))
