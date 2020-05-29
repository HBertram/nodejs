
package pers.bertram.planeverything.dao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pers.bertram.planeverything.dao.entity.UserPlanMap;

@Repository
public interface UserPlanMapRepository extends JpaRepository<UserPlanMap, String>{
    
}
