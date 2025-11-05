create table admin
(
    admin_id int auto_increment primary key,
    username varchar(50)  not null,
    password varchar(255) not null,
    constraint username
    unique (username)
);

create table doctor
(
    doctor_id             int auto_increment primary key,
    username              varchar(50)  not null,
    password              varchar(255) not null,
    first_name            varchar(100) null,
    last_name             varchar(100) null,
    date_of_birth         date         null,
    identification_number varchar(50)  null,
    gender                varchar(20)  null,
    specialization        varchar(100) null,
    status                varchar(50)  null,
    constraint identification_number unique (identification_number),
    constraint username unique (username)
);

create table doctor_availability
(
    availability_id int auto_increment
        primary key,
    doctor_id       int                                  not null,
    day_of_week     int                                  not null comment '0=Sunday, 1=Monday, ..., 6=Saturday',
    start_time      time                                 not null,
    end_time        time                                 not null,
    is_available    tinyint(1) default 1                 null,
    created_at      timestamp  default CURRENT_TIMESTAMP null,
    updated_at      timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint doctor_availability_ibfk_1
        foreign key (doctor_id) references doctor (doctor_id)
            on delete cascade
);

create index idx_doctor_availability
    on doctor_availability (doctor_id, day_of_week);

create table patient
(
    patient_id               int auto_increment
        primary key,
    username                 varchar(50)                         not null,
    password                 varchar(255)                        not null,
    first_name               varchar(100)                        null,
    last_name                varchar(100)                        null,
    date_of_birth            date                                null,
    gender                   varchar(20)                         null,
    identification_number    varchar(50)                         null,
    email                    varchar(100)                        null,
    phone_number             varchar(20)                         null,
    address                  text                                null,
    emergency_contact_name   varchar(255)                        null,
    emergency_contact_number varchar(20)                         null,
    blood_type               varchar(10)                         null comment 'Moved from Medical_Record - core patient info',
    created_at               timestamp default CURRENT_TIMESTAMP null,
    updated_at               timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint email
        unique (email),
    constraint identification_number
        unique (identification_number),
    constraint username
        unique (username)
);

create table booking
(
    booking_id       int auto_increment
        primary key,
    patient_id       int                                   null,
    doctor_id        int                                   null,
    admin_id         int                                   null,
    booking_date     date                                  null,
    booking_time     time                                  null,
    end_time         time                                  null,
    payment_method   varchar(50)                           null,
    reason_for_visit text                                  null,
    status           varchar(50) default 'Pending'         null,
    created_at       timestamp   default CURRENT_TIMESTAMP null,
    updated_at       timestamp   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint booking_ibfk_1
        foreign key (patient_id) references patient (patient_id)
            on delete cascade,
    constraint booking_ibfk_2
        foreign key (doctor_id) references doctor (doctor_id)
            on delete set null,
    constraint booking_ibfk_3
        foreign key (admin_id) references admin (admin_id)
            on delete set null
);

create index admin_id
    on booking (admin_id);

create index idx_booking_date
    on booking (booking_date);

create index idx_doctor_datetime
    on booking (doctor_id, booking_date, booking_time);

create index idx_doctor_id
    on booking (doctor_id);

create index idx_patient_id
    on booking (patient_id);

create table invoice
(
    invoice_id     int auto_increment
        primary key,
    patient_id     int                                                                               not null,
    doctor_id      int                                                                               null,
    booking_id     int                                                                               null comment 'Optional: Link to appointment',
    invoice_number varchar(50)                                                                       not null comment 'Auto-generated invoice number',
    invoice_date   date                                                                              not null,
    due_date       date                                                                              null,
    payment_method enum ('Cash', 'Card', 'Insurance', 'Other')             default 'Cash'            null,
    payment_status enum ('Pending', 'Paid', 'Partially Paid', 'Cancelled') default 'Pending'         null,
    subtotal       decimal(10, 2)                                          default 0.00              not null,
    tax            decimal(10, 2)                                          default 0.00              null,
    discount       decimal(10, 2)                                          default 0.00              null,
    total_amount   decimal(10, 2)                                                                    not null,
    amount_paid    decimal(10, 2)                                          default 0.00              null,
    notes          text                                                                              null,
    created_at     timestamp                                               default CURRENT_TIMESTAMP null,
    updated_at     timestamp                                               default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint invoice_number
        unique (invoice_number),
    constraint invoice_ibfk_1
        foreign key (patient_id) references patient (patient_id)
            on delete cascade,
    constraint invoice_ibfk_2
        foreign key (doctor_id) references doctor (doctor_id)
            on delete set null,
    constraint invoice_ibfk_3
        foreign key (booking_id) references booking (booking_id)
            on delete set null
);

create index booking_id
    on invoice (booking_id);

create index idx_doctor_invoices
    on invoice (doctor_id);

create index idx_invoice_date
    on invoice (invoice_date);

create index idx_patient_invoices
    on invoice (patient_id);

create index idx_payment_status
    on invoice (payment_status);

create table invoice_item
(
    item_id     int auto_increment
        primary key,
    invoice_id  int                                 not null,
    description varchar(255)                        not null comment 'Service/item description',
    quantity    int       default 1                 null,
    unit_price  decimal(10, 2)                      not null,
    amount      decimal(10, 2)                      not null comment 'quantity * unit_price',
    created_at  timestamp default CURRENT_TIMESTAMP null,
    constraint invoice_item_ibfk_1
        foreign key (invoice_id) references invoice (invoice_id)
            on delete cascade
);

create index idx_invoice_items
    on invoice_item (invoice_id);

create table medical_report
(
    report_id         int auto_increment
        primary key,
    patient_id        int                                   not null,
    booking_id        int                                   null comment 'Link to the appointment that generated this report',
    doctor_id         int                                   null comment 'Doctor who created the report (nullable if doctor is deleted)',
    admin_id          int                                   null comment 'Admin who may have filed/processed the report',
    report_type       varchar(100)                          not null comment 'e.g., Lab Results, X-Ray, Physical Exam, Consultation Note',
    report_date       date                                  not null,
    diagnosis         text                                  null,
    treatment_plan    text                                  null,
    tests_recommended text                                  null,
    followup_date     date                                  null,
    notes             text                                  null,
    file_path         varchar(255)                          null comment 'Path to PDF or scanned document',
    status            varchar(50) default 'Active'          null,
    created_at        timestamp   default CURRENT_TIMESTAMP null,
    updated_at        timestamp   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint medical_report_ibfk_1
        foreign key (patient_id) references patient (patient_id)
            on delete cascade,
    constraint medical_report_ibfk_2
        foreign key (booking_id) references booking (booking_id)
            on delete set null,
    constraint medical_report_ibfk_3
        foreign key (doctor_id) references doctor (doctor_id)
            on delete set null,
    constraint medical_report_ibfk_4
        foreign key (admin_id) references admin (admin_id)
            on delete set null
);

create index admin_id
    on medical_report (admin_id);

create index booking_id
    on medical_report (booking_id);

create index doctor_id
    on medical_report (doctor_id);

create index idx_patient_reports
    on medical_report (patient_id);

create index idx_report_date
    on medical_report (report_date);

create index idx_report_type
    on medical_report (report_type);

create table patient_allergy
(
    allergy_id     int auto_increment
        primary key,
    patient_id     int                                                           not null,
    allergen       varchar(255)                                                  not null comment 'Name of the allergen (e.g., Penicillin, Peanuts)',
    reaction       text                                                          null comment 'Description of the allergic reaction',
    severity       enum ('Mild', 'Moderate', 'Severe') default 'Moderate'        null,
    diagnosed_date date                                                          null comment 'When the allergy was diagnosed',
    notes          text                                                          null,
    is_active      tinyint(1)                          default 1                 null comment 'Allergy may become inactive over time',
    created_at     timestamp                           default CURRENT_TIMESTAMP null,
    updated_at     timestamp                           default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint patient_allergy_ibfk_1
        foreign key (patient_id) references patient (patient_id)
            on delete cascade
);

create index idx_patient_allergies
    on patient_allergy (patient_id);

create table patient_condition
(
    condition_id   int auto_increment
        primary key,
    patient_id     int                                                                              not null,
    condition_name varchar(255)                                                                     not null comment 'e.g., Hypertension, Type 2 Diabetes',
    diagnosed_date date                                                                             null comment 'When the condition was diagnosed',
    status         enum ('Active', 'Managed', 'Resolved', 'In Remission') default 'Active'          null,
    notes          text                                                                             null,
    created_at     timestamp                                              default CURRENT_TIMESTAMP null,
    updated_at     timestamp                                              default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint patient_condition_ibfk_1
        foreign key (patient_id) references patient (patient_id)
            on delete cascade
);

create index idx_patient_conditions
    on patient_condition (patient_id);

create table patient_medicine
(
    patient_medicine_id int auto_increment
        primary key,
    patient_id          int                                                                    not null,
    condition_id        int                                                                    null comment 'Optional: Link to the condition being treated',
    medication_name     varchar(255)                                                           not null,
    dosage              varchar(100)                                                           null,
    frequency           varchar(100)                                                           null,
    start_date          date                                                                   null,
    end_date            date                                                                   null comment 'NULL if ongoing',
    status              enum ('Active', 'Discontinued', 'Completed') default 'Active'          null,
    notes               text                                                                   null,
    created_at          timestamp                                    default CURRENT_TIMESTAMP null,
    updated_at          timestamp                                    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint patient_medicine_ibfk_1
        foreign key (patient_id) references patient (patient_id)
            on delete cascade,
    constraint patient_medicine_ibfk_2
        foreign key (condition_id) references patient_condition (condition_id)
            on delete set null
);

create index idx_condition_medicines
    on patient_medicine (condition_id);

create index idx_patient_medicines
    on patient_medicine (patient_id);

create table prescription
(
    prescription_id int auto_increment
        primary key,
    patient_id      int                                   not null,
    doctor_id       int                                   null,
    booking_id      int                                   null comment 'The appointment when prescribed',
    medication_name varchar(255)                          not null,
    dosage          varchar(100)                          not null,
    frequency       varchar(100)                          not null,
    duration        varchar(100)                          null,
    quantity        int                                   null,
    refills         int         default 0                 null,
    instructions    text                                  null,
    prescribed_date date                                  not null,
    start_date      date                                  null,
    end_date        date                                  null,
    status          varchar(50) default 'Active'          null comment 'Active, Completed, Cancelled',
    notes           text                                  null,
    created_at      timestamp   default CURRENT_TIMESTAMP null,
    updated_at      timestamp   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint prescription_ibfk_1
        foreign key (patient_id) references patient (patient_id)
            on delete cascade,
    constraint prescription_ibfk_2
        foreign key (doctor_id) references doctor (doctor_id)
            on delete set null,
    constraint prescription_ibfk_3
        foreign key (booking_id) references booking (booking_id)
            on delete set null
);

create index booking_id
    on prescription (booking_id);

create index idx_doctor_prescriptions
    on prescription (doctor_id);

create index idx_patient_prescriptions
    on prescription (patient_id);

create index idx_prescription_date
    on prescription (prescribed_date);

create table sick_note
(
    sick_note_id     int auto_increment
        primary key,
    patient_id       int                                   not null,
    doctor_id        int                                   not null,
    issue_date       date                                  not null,
    start_date       date                                  not null,
    end_date         date                                  not null,
    diagnosis        text                                  not null,
    recommendations  text                                  null,
    restrictions     text                                  null,
    can_return_work  tinyint(1)  default 0                 null,
    additional_notes text                                  null,
    status           varchar(50) default 'Active'          null,
    created_at       timestamp   default CURRENT_TIMESTAMP null,
    updated_at       timestamp   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint sick_note_ibfk_1
        foreign key (patient_id) references patient (patient_id),
    constraint sick_note_ibfk_2
        foreign key (doctor_id) references doctor (doctor_id)
);

create index doctor_id
    on sick_note (doctor_id);

create index patient_id
    on sick_note (patient_id);

create table support_ticket
(
    ticket_id   int auto_increment
        primary key,
    doctor_id   int                                                                                            not null,
    subject     varchar(255)                                                                                   not null,
    category    enum ('Technical', 'Billing', 'General', 'Feature Request', 'Other') default 'General'         null,
    priority    enum ('Low', 'Medium', 'High', 'Urgent')                             default 'Medium'          null,
    status      enum ('Open', 'In Progress', 'Resolved', 'Closed')                   default 'Open'            null,
    description text                                                                                           not null,
    response    text                                                                                           null,
    created_at  timestamp                                                            default CURRENT_TIMESTAMP null,
    updated_at  timestamp                                                            default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    resolved_at timestamp                                                                                      null,
    constraint support_ticket_ibfk_1
        foreign key (doctor_id) references doctor (doctor_id)
);

create index doctor_id
    on support_ticket (doctor_id);

