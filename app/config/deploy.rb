set :application, "apologize"
set :deploy_to, "/usr/share/nginx/apologize"
set :domain, "apologize.ovh"
set :scm, :git
set :repository, "git@bitbucket.org:apologize/apologize.git"
role :web, domain
role :app, domain
role :db, domain, :primary => true
set :use_sudo, false
set :keep_releases, 3

logger.level = Logger::MAX_LEVEL

