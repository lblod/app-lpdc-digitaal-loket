# Restore backup from production to acceptance

On production machine

```shell
cd /tmp

# connect to storagebox where backups are saved (or use recursive search control + r)
ssh -p 23 -i /root/.ssh/backups_rsa <your storagebox host>
# find backup you want to restore
ls
exit

# secure copy backup to tmp folder
scp -P 23 -i /root/.ssh/backups_rsa -r <your storagebox host>:/home/data_backup_20231107T040001 /tmp
exit

```

On local machine

```shell
 scp -p -r root@lpdc-prod.s.redhost.be:/tmp/data_backup_20231107T040001 /tmp
 
 scp -p -r /tmp/data_backup_20231107T040001 root@lpdc-dev.s.redhost.be:/tmp
```

On dev machine

```shell
cd /data/app-lpdc-digitaal-loket-acc
drc down
rm -rf data
cp -r /tmp/data_backup_20231107T040001/data/app-lpdc-digitaal-loket/data data/
drc up -d

#clean up
cd /tmp
rm -rf data_backup_20231107T040001
```

on production machine

```shell
#clean up
cd /tmp
rm -rf data_backup_20231107T040001
```
